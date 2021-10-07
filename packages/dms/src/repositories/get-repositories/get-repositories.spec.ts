import { Context } from "../../utils/context";
import { AxiosResponse, HttpResponse } from "../../utils/http";
import { Repository } from "../get-repository/get-repository";
import { getRepositoriesDefaultTransformFunction, getRepositoriesFactory } from "./get-repositories";

describe("getRepositoriesFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: Context;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
  });

  it("should make correct request", async () => {

    const getRepositories = getRepositoriesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getRepositories(context);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["allrepos"],
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: AxiosResponse = { data: { test: "HiItsMeTest" } } as AxiosResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getRepositories = getRepositoriesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getRepositories(context);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
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

      const getRepositories = getRepositoriesFactory(mockHttpRequestFunction, getRepositoriesDefaultTransformFunction);
      const result: Repository[] = await getRepositories(context);

      data.repositories.forEach((repoDto: any, i: number) => {
        expect(result[i]).toHaveProperty("id", repoDto.id);
        expect(result[i]).toHaveProperty("name", repoDto.name);
        expect(result[i]).toHaveProperty("sourceId", repoDto._links.source.href);
      });
    });
  });
});
