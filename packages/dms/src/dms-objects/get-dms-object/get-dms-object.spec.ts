import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  DmsObject,
  GetDmsObjectParams,
  onResponse,
  getDmsObject,
} from "./get-dms-object";
import { fetchDmsObjectFile, getDmsObjectMainFile, getDmsObjectPdfFile } from "../get-dms-object-file/get-dms-object-file";
import { getDmsObjectNotes } from "../get-dms-object-notes/get-dms-object-notes";
import { searchDmsObjects } from "../search-dms-objects/search-dms-objects";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

jest.mock("../get-dms-object-file/get-dms-object-file");
jest.mock("../get-dms-object-notes/get-dms-object-notes");
jest.mock("../search-dms-objects/search-dms-objects");

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;
const mockFetchDmsObjectFile = fetchDmsObjectFile as jest.MockedFunction<typeof fetchDmsObjectFile>;
const mockGetDmsObjectMainFile = getDmsObjectMainFile as jest.MockedFunction<typeof getDmsObjectMainFile>;
const mockGetDmsObjectPdfFile = getDmsObjectPdfFile as jest.MockedFunction<typeof getDmsObjectPdfFile>;
const mockGetDmsObjectNotes = getDmsObjectNotes as jest.MockedFunction<typeof getDmsObjectNotes>;
const mockSearchDmsObjects = searchDmsObjects as jest.MockedFunction<typeof searchDmsObjects>;

describe("getDmsObject", () => {

  let context: DvelopContext;
  let params: GetDmsObjectParams;

  beforeEach(() => {
    jest.resetAllMocks();

    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };
  });

  it("should call dvelopFetch with method GET and a default onResponse", async () => {
    await getDmsObject(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}?sourceid=${params.sourceId}`,
      { method: "GET" },
      expect.objectContaining({ onResponse: expect.any(Function) })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getDmsObject(context, params, options);

    expect(mockDvelopFetch).toHaveBeenCalledWith(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}?sourceid=${params.sourceId}`, { method: "GET" }, options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    it("should map base fields and not set any link-functions when no relevant links are present", async () => {
      const data = {
        _links: { HiItsMeLink: { href: "HiItsMeLinkHref" } },
        sourceProperties: [
          { key: "HiItsMeSourcePropertyId1", value: "HiItsMeSourcePropertyValue1" },
          { key: "HiItsMeSourcePropertyId2", value: "HiItsMeSourcePropertyValue2" }
        ],
        sourceCategories: ["HiItsMeSourceCategoriyId1", "HiItsMeSourceCategoriyId2"]
      };

      const result = await onResponse(context, params)(jsonResponse(data)) as DmsObject;

      expect(result).toEqual({
        repositoryId: params.repositoryId,
        sourceId: params.sourceId,
        dmsObjectId: params.dmsObjectId,
        properties: data.sourceProperties,
        categories: data.sourceCategories
      });
      expect(result.getMainFile).toBeUndefined();
      expect(result.getPdfFile).toBeUndefined();
      expect(result.searchChildren).toBeUndefined();
      expect(result.getNotes).toBeUndefined();
    });

    it("should set getMainFile when mainblobcontent link present and call fetchDmsObjectFile with href", async () => {
      const data = { _links: { mainblobcontent: { href: "HiItsMeMainBlobContentHref" } }, sourceProperties: [], sourceCategories: [] };
      const mainFile = new ArrayBuffer(42);
      mockFetchDmsObjectFile.mockResolvedValue(mainFile);

      const result = await onResponse(context, params)(jsonResponse(data));

      expect(result.getMainFile).toEqual(expect.any(Function));
      const resultFile = await result.getMainFile!();
      expect(mockFetchDmsObjectFile).toHaveBeenCalledWith(context, data._links.mainblobcontent.href);
      expect(resultFile).toBe(mainFile);
    });

    it("should set getPdfFile when pdfblobcontent link present and call fetchDmsObjectFile with href", async () => {
      const data = { _links: { pdfblobcontent: { href: "HiItsMePdfBlobContentHref" } }, sourceProperties: [], sourceCategories: [] };
      const pdfFile = new ArrayBuffer(42);
      mockFetchDmsObjectFile.mockResolvedValue(pdfFile);

      const result = await onResponse(context, params)(jsonResponse(data));

      expect(result.getPdfFile).toEqual(expect.any(Function));
      const resultFile = await result.getPdfFile!();
      expect(mockFetchDmsObjectFile).toHaveBeenCalledWith(context, data._links.pdfblobcontent.href);
      expect(resultFile).toBe(pdfFile);
    });

    it("should set searchChildren when children link present and delegate to searchDmsObjects", async () => {
      const data = { _links: { children: { href: "x" } }, sourceProperties: [], sourceCategories: [] };
      const searchResult = { page: 42, dmsObjects: [] };
      mockSearchDmsObjects.mockResolvedValue(searchResult);

      const result = await onResponse(context, params)(jsonResponse(data));

      expect(result.searchChildren).toEqual(expect.any(Function));
      const resultChildren = await result.searchChildren!();
      expect(mockSearchDmsObjects).toHaveBeenCalledWith(context, {
        repositoryId: params.repositoryId,
        sourceId: params.sourceId,
        childrenOf: params.dmsObjectId
      });
      expect(resultChildren).toBe(searchResult);
    });

    it("should set getNotes when notes link present and delegate to getDmsObjectNotes", async () => {
      const data = { _links: { notes: { href: "x" } }, sourceProperties: [], sourceCategories: [] };
      const notes = [{
        created: new Date(),
        creator: { id: "HiItsMeCreatorId", displayName: "HiItsMeCreatorDisplayName" },
        text: "HiItsMeNoteText"
      }];
      mockGetDmsObjectNotes.mockResolvedValue(notes);

      const result = await onResponse(context, params)(jsonResponse(data));

      expect(result.getNotes).toEqual(expect.any(Function));
      const resultNotes = await result.getNotes!();
      expect(mockGetDmsObjectNotes).toHaveBeenCalledWith(context, params);
      expect(resultNotes).toBe(notes);
    });
  });
});
