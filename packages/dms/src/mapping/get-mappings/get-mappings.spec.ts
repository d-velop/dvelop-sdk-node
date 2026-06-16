import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  DmsMapping,
  GetMappingsParams,
  onResponse,
  getMappings,
} from "./get-mappings";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getMappings", () => {

  let context: DvelopContext;
  let params: GetMappingsParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { repositoryId: "HiItsMeRepositoryId", sourceId: "HiItsMeSourceId" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getMappings(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}/m?sourceId=${params.sourceId}`,
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getMappings(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_getDmsMappingsDefaultTransformFunction", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map mappings correctly", async () => {
      const data = {
        mappings: [
          {
            name: "My Test Mapping",
            sourceId: params.sourceId,
            mappingItems: [
              { destination: "dest1", source: "source1", type: 1 },
              { destination: "dest2", source: "source2", type: 0 }
            ]
          },
          {
            name: "My Other Mapping",
            sourceId: params.sourceId,
            mappingItems: [
              { destination: "dest1_1", source: "source1_1", type: 1 }
            ]
          }
        ]
      };

      const result: DmsMapping[] = await onResponse(jsonResponse(data));

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        sourceId: params.sourceId,
        name: "My Test Mapping",
        mappingItems: data.mappings[0].mappingItems
      });
      expect(result[1]).toMatchObject({
        sourceId: params.sourceId,
        name: "My Other Mapping",
        mappingItems: data.mappings[1].mappingItems
      });
    });
  });
});
