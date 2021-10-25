import { DvelopContext, DmsError } from "../../index";
import { HttpResponse } from "../../internals";
import { createDmsObjectDefaultStoreFileFunction, createDmsObjectDefaultTransformFunction, createDmsObjectFactory, CreateDmsObjectParams } from "./create-dms-object";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";

jest.mock("../store-file-temporarily/store-file-temporarily");
const mockStoryFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

describe("createDmsObject", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();
  let mockStoreFileFunction = jest.fn();

  let context: DvelopContext;
  let params: CreateDmsObjectParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      categoryId: "HiItsMeCategoryId",
      properties: [
        {
          key: "HiItsMeProperty1Key",
          values: ["HiItsMeProperty1Value"]
        },
        {
          key: "HiItsMeProperty2Key",
          values: ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"]
        }
      ]
    };
  });

  [
    { param: "contentUri", expectStoreFileCall: false },
    { param: "contentLocationUri", expectStoreFileCall: false }
  ].forEach(testCase => {

    it(`should ${testCase.expectStoreFileCall ? "" : "not"} throw on content`, async () => {

      params.contentUri = "HiItsMeContentUri";
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
      expect(async () => await createDmsObject(context, params)).not.toThrow();
    });

  });

  describe("on contentUri", () => {

    it("should pass without storeFileFunction", async () => {

      params.contentUri = "HiItsMeContentUri";
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
      expect(async () => await createDmsObject(context, params)).not.toThrow();
    });

    it("should not call storeFileFunction", async () => {

      params.contentUri = "HiItsMeContentUri";
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
      await createDmsObject(context, params);

      expect(mockStoreFileFunction).toHaveBeenCalledTimes(0);
    });
  });

  describe("on contentLocationUri", () => {

    it("should pass without storeFileFunction", async () => {

      params.contentLocationUri = "HiItsMeContenLocationtUri";
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
      expect(async () => await createDmsObject(context, params)).not.toThrow();
    });

    it("should not call storeFileFunction if contentLocationUri is given", async () => {

      params.contentLocationUri = "HiItsMeContentLocationUri";
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
      await createDmsObject(context, params);

      expect(mockStoreFileFunction).toHaveBeenCalledTimes(0);
    });
  });

  describe("on content", () => {
    it("should call storeFileFunction if content is given", async () => {

      params.content = new ArrayBuffer(42);
      mockStoreFileFunction.mockReturnValue({ setAs: "contentUri", uri: "HiItsMeUri" });

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
      await createDmsObject(context, params);

      expect(mockStoreFileFunction).toHaveBeenCalledTimes(1);
      expect(mockStoreFileFunction).toHaveBeenCalledWith(context, params);
    });

    it("should throw on no storeFileFunction", async () => {

      params.content = new ArrayBuffer(42);
      mockStoreFileFunction.mockReturnValue({ setAs: "contentUri", uri: "HiItsMeUri" });

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction);
      let expectedError: DmsError;
      try {
        await createDmsObject(context, params);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof DmsError).toBeTruthy();
      expect(expectedError.message).toEqual("DmsObject cannot be created with content. No storeFile-function has been supplied.");
    });
  });



  it("should make correct request", async () => {

    const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await createDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping"],
      templates: { "repositoryid": params.repositoryId },
      data: {
        "sourceId": params.sourceId,
        "sourceCategory": params.categoryId,
        "sourceProperties": {
          "properties": params.properties
        },
        "fileName": params.fileName,
        "contentLocationUri": params.contentLocationUri,
        "contentUri": params.contentUri
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await createDmsObject(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("createDmsObjectDefaultTransformer", () => {

    const dmsObjectId: string = "HiItsMeDmsObjectId";

    [
      `/${dmsObjectId}`,
      `/${dmsObjectId}?`,
      `hi/i/am/an/uri/${dmsObjectId}`,
      `hi/i/am/an/uri/${dmsObjectId}?withQueryParams`,
    ].forEach(testCase => {
      it(`should return parse ${testCase}`, async () => {

        mockHttpRequestFunction.mockResolvedValue({ headers: { location: testCase } });

        const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, createDmsObjectDefaultTransformFunction, mockStoreFileFunction);
        const result = await createDmsObject(context, params);

        expect(result).toHaveProperty("repositoryId", params.repositoryId);
        expect(result).toHaveProperty("sourceId", params.sourceId);
        expect(result).toHaveProperty("dmsObjectId", dmsObjectId);
      });
    });

    it("should throw on parse error", async () => {

      const location: string = "HiImWrong";
      mockHttpRequestFunction.mockResolvedValue({ headers: { location: location } });

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, createDmsObjectDefaultTransformFunction, mockStoreFileFunction);
      let expectedError: Error;
      try {
        await createDmsObject(context, params);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof DmsError).toBeTruthy();
      expect(expectedError.message).toContain("Failed to parse dmsObjectId");
      expect(expectedError.message).toContain(location);
    });
  });

  describe("createDmsObjectDefaultStoreFileFunction", () => {

    it("should call storeFileTemporarily correctly", async () => {

      const temporaryFileUrl = "HiItsMeTemporaryFileUrl";
      mockStoryFileTemporarily.mockResolvedValue(temporaryFileUrl);
      params.content = new ArrayBuffer(42);

      const createDmsObject = createDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, createDmsObjectDefaultStoreFileFunction);
      await createDmsObject(context, params);

      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(1);
      expect(mockStoryFileTemporarily).toHaveBeenCalledWith(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
        data: expect.objectContaining({
          contentLocationUri: temporaryFileUrl
        })
      }));
    });
  });
});
