import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  SearchDmsObjectsParams,
  SearchDmsObjectsResultPage,
  onResponseFactory,
  searchDmsObjects,
} from "./search-dms-objects";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("searchDmsObjects", () => {

  let context: DvelopContext;
  let params: SearchDmsObjectsParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { repositoryId: "HiItsMeRepositoryId", sourceId: "HiItsMeSourceId" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await searchDmsObjects(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}/srm`,
      { method: "GET" },
      expect.objectContaining({ onResponse: expect.any(Function) })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await searchDmsObjects(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_searchDmsObjectsDefaultTransformFunctionFactory", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should set page", async () => {
      const transform = onResponseFactory(context, params);
      const result = await transform(jsonResponse({ page: 3, items: [] }));

      expect(result).toHaveProperty("page", 3);
      expect(result.getPreviousPage).toBeUndefined();
      expect(result.getNextPage).toBeUndefined();
    });

    it("should transform items", async () => {
      const data = {
        page: 3,
        items: [
          {
            id: "HiItsMeDmsObjectId1",
            sourceProperties: [
              { key: "HiItsMeProperty1Key", value: "HiItsMeProperty1Value", isMultiValue: false }
            ],
            sourceCategories: ["HiItsMeCategory1"]
          },
          {
            id: "HiItsMeDmsObjectId2",
            sourceProperties: [],
            sourceCategories: ["HiItsMeCategory1"]
          }
        ]
      };

      const transform = onResponseFactory(context, params);
      const result = await transform(jsonResponse(data));

      expect(result.dmsObjects).toHaveLength(2);
      expect(result.dmsObjects[0]).toMatchObject({
        repositoryId: params.repositoryId,
        sourceId: params.sourceId,
        dmsObjectId: "HiItsMeDmsObjectId1",
        properties: data.items[0].sourceProperties,
        categories: data.items[0].sourceCategories
      });
      expect(result.dmsObjects[0].getMainFile).toBeUndefined();
    });

    it("should set getMainFile when mainblobcontent link present and call dvelopFetch on invocation", async () => {
      const data = {
        page: 3,
        items: [{
          _links: { mainblobcontent: { href: "HiItsMeMainBlobContentHref" } },
          id: "HiItsMeDmsObjectId1",
          sourceProperties: [],
          sourceCategories: ["HiItsMeCategory1"]
        }]
      };

      const transform = onResponseFactory(context, params);
      const result = await transform(jsonResponse(data));

      expect(result.dmsObjects[0].getMainFile).toEqual(expect.any(Function));

      const href = "HiItsMeMainBlobContentHref";
      mockDvelopFetch.mockResolvedValueOnce(href);
      mockDvelopFetch.mockResolvedValueOnce(new ArrayBuffer(42));
      await result.dmsObjects[0].getMainFile!();

      expect(mockDvelopFetch).toHaveBeenLastCalledWith(
        context,
        href,
        { method: "GET", headers: { "Accept": "application/octet-stream" } },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
    });

    it("should set getPreviousPage when prev link present", async () => {
      const data = { _links: { prev: { href: "HiItsMePreviousHref" } }, page: 3, items: [] };

      const transform = onResponseFactory(context, params);
      const result = await transform(jsonResponse(data));

      expect(result.getPreviousPage).toEqual(expect.any(Function));

      const prevResultData = { page: 2, items: [] };
      mockDvelopFetch.mockResolvedValueOnce(prevResultData as unknown as SearchDmsObjectsResultPage);
      await result.getPreviousPage!();

      expect(mockDvelopFetch).toHaveBeenLastCalledWith(
        context,
        { href: "HiItsMePreviousHref" },
        { method: "GET" },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
    });

    it("should set getNextPage when next link present", async () => {
      const data = { _links: { next: { href: "HiItsMeNextHref" } }, page: 3, items: [] };

      const transform = onResponseFactory(context, params);
      const result = await transform(jsonResponse(data));

      expect(result.getNextPage).toEqual(expect.any(Function));

      const nextResultData = { page: 4, items: [] };
      mockDvelopFetch.mockResolvedValueOnce(nextResultData as unknown as SearchDmsObjectsResultPage);
      await result.getNextPage!();

      expect(mockDvelopFetch).toHaveBeenLastCalledWith(
        context,
        { href: "HiItsMeNextHref" },
        { method: "GET" },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
    });
  });
});
