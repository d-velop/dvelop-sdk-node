import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { GetMappingsParams, _getDmsMappingFactory, _getDmsMappingsDefaultTransformFunction, DmsMapping } from "./get-mappings";

describe("getMappings", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetMappingsParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId"
    };
  });

  it("should make correct request", async () => {

    const getDmsObject = _getDmsMappingFactory(mockHttpRequestFunction, mockTransformFunction);
    await getDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "mappingconfig"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getMappings = _getDmsMappingFactory(mockHttpRequestFunction, mockTransformFunction);
    await getMappings(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getDmsMappingsDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        "mappings": [
          {
            "_links": {
              "self": "Mapping1"
            },
            "name": "My Test Mapping",
            "sourceId": params.sourceId,
            "mappingItems": [
              {
                "destination": "dest1",
                "source": "source1",
                "type": 1
              },
              {
                "destination": "dest2",
                "source": "source2",
                "type": 0
              }
            ]
          },
          {
            "_links": {
              "self": "Mapping2"
            },
            "name": "My Other Mapping",
            "sourceId": params.sourceId,
            "mappingItems": [
              {
                "destination": "dest1_1",
                "source": "source1_1",
                "type": 1
              },
            ]
          }
        ]
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const getMappings = _getDmsMappingFactory(mockHttpRequestFunction, _getDmsMappingsDefaultTransformFunction);
      const result: DmsMapping[] = await getMappings(context, params);

      expect(result).toHaveLength(2);

      expect(result[0]).toHaveProperty("sourceId", params.sourceId);
      expect(result[0]).toHaveProperty("name", "My Test Mapping");
      expect(result[0]).toHaveProperty("mappingItems[0].destination", "dest1");
      expect(result[0]).toHaveProperty("mappingItems[0].source", "source1");
      expect(result[0]).toHaveProperty("mappingItems[0].type", 1);
      expect(result[0]).toHaveProperty("mappingItems[1].destination", "dest2");
      expect(result[0]).toHaveProperty("mappingItems[1].source", "source2");
      expect(result[0]).toHaveProperty("mappingItems[1].type", 0);

      expect(result[1]).toHaveProperty("sourceId", params.sourceId);
      expect(result[1]).toHaveProperty("name", "My Other Mapping");
      expect(result[1]).toHaveProperty("mappingItems[0].destination", "dest1_1");
      expect(result[1]).toHaveProperty("mappingItems[0].source", "source1_1");
      expect(result[1]).toHaveProperty("mappingItems[0].type", 1);
    });
  });
});
