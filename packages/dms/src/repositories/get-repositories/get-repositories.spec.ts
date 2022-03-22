import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { Repository } from "../get-repository/get-repository";
import { _getRepositoriesDefaultTransformFunction, _getRepositoriesFactory } from "./get-repositories";

describe("getRepositoriesFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
  });

  it("should make correct request", async () => {

    const getRepositories = _getRepositoriesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getRepositories(context);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["allrepos"],
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getRepositories = _getRepositoriesFactory(mockHttpRequestFunction, mockTransformFunction);
    const result = await getRepositories(context);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
    expect(result).toEqual(transformResult);
  });

  describe("getRepositoriesDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        "_links": {
          "self": {
            "href": "/dms/r/"
          }
        },
        "repositories": [
          {
            "_links": {
              "HiItsMeLink1": {
                "href": "HiItsMeHref1",
                "templated": true
              },
              "source": {
                "href": "HiItsMeSource1",
              }
            },
            "id": "HiItsMeRepoId1",
            "name": "HiItsMeName1",
            "supportsFulltextSearch": true,
            "serverId": "HiItsMeServerId1",
            "available": true,
            "isDefault": false,
            "version": "HiItsMeVersion1"
          }, {
            "_links": {
              "HiItsMeLink2": {
                "href": "HiItsMeHref2",
                "templated": true
              },
              "source": {
                "href": "HiItsMeSource2",
              }
            },
            "id": "HiItsMeRepoId2",
            "name": "HiItsMeName2",
            "supportsFulltextSearch": true,
            "serverId": "HiItsMeServerId2",
            "available": true,
            "isDefault": false,
            "version": "HiItsMeVersion2"
          }
        ],
        "count": 1,
        "hasAdminRight": false
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getRepositories = _getRepositoriesFactory(mockHttpRequestFunction, _getRepositoriesDefaultTransformFunction);
      const result: Repository[] = await getRepositories(context);

      data.repositories.forEach((repoDto: any, i: number) => {
        expect(result[i]).toHaveProperty("repositoryId", repoDto.id);
        expect(result[i]).toHaveProperty("name", repoDto.name);
        expect(result[i]).toHaveProperty("sourceId", repoDto._links.source.href);
      });
    });
  });
});
