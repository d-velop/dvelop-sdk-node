import { DvelopContext } from "../../index";
import { HttpResponse } from "../../internals";
import { GetRepositoryParams, Repository, getRepositoryDefaultTransformFunction, getRepositoryFactory } from "./get-repository";


describe("getRepositoryFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetRepositoryParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId"
    };
  });

  it("should make correct request", async () => {

    const getRepository = getRepositoryFactory(mockHttpRequestFunction, mockTransformFunction);
    await getRepository(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getRepository = getRepositoryFactory(mockHttpRequestFunction, mockTransformFunction);
    await getRepository(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getRepositoryDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        "_links": {
          "HiItsMeLink": {
            "href": "HiItsMeHref",
            "templated": true
          },
          "source": {
            "href": "HiItsMeSource",
          }
        },
        "id": "HiItsMeRepoId",
        "name": "HiItsMeName",
        "supportsFulltextSearch": true,
        "serverId": "HiItsMeServerId",
        "available": true,
        "isDefault": false,
        "version": "HiItsMeVersion"
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getRepository = getRepositoryFactory(mockHttpRequestFunction, getRepositoryDefaultTransformFunction);
      const result: Repository = await getRepository(context, params);

      expect(result).toHaveProperty("id", data.id);
      expect(result).toHaveProperty("name", data.name);
      expect(result).toHaveProperty("sourceId", data._links.source.href);
    });
  });
});
