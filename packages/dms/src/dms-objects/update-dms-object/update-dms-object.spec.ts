import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";
import { updateDmsObjectDefaultStoreFileFunction, _updateDmsObjectDefaultTransformFunction, _updateDmsObjectFactory, UpdateDmsObjectParams } from "./update-dms-object";

jest.mock("../store-file-temporarily/store-file-temporarily");
const mockStoryFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

describe("updateDmsObject", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();
  let mockStoreFileFunction = jest.fn();

  let context: DvelopContext;
  let params: UpdateDmsObjectParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      alterationText: "HiItsMeAlterationText",
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

  it("should not call storeFileFunction if contentUri is given", async () => {

    params.contentUri = "HiItsMeContentUri";
    params.content = new ArrayBuffer(42);

    const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await updateDmsObject(context, params);

    expect(mockStoreFileFunction).toHaveBeenCalledTimes(0);
  });

  it("should not call storeFileFunction if contentLocationUri is given", async () => {

    params.contentLocationUri = "HiItsMeContentUri";
    params.content = new ArrayBuffer(42);

    const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await updateDmsObject(context, params);

    expect(mockStoreFileFunction).toHaveBeenCalledTimes(0);
  });

  it("should call storeFileFunction if content is given", async () => {

    params.content = new ArrayBuffer(42);
    mockStoreFileFunction.mockReturnValue({ setAs: "contentUri", uri: "HiItsMeUri" });

    const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await updateDmsObject(context, params);

    expect(mockStoreFileFunction).toHaveBeenCalledTimes(1);
    expect(mockStoreFileFunction).toHaveBeenCalledWith(context, params);
  });

  it("should make correct request", async () => {

    const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await updateDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "PUT",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "sourceId": params.sourceId,
        "alterationText": params.alterationText,
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

    const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, mockStoreFileFunction);
    await updateDmsObject(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("updateDmsObjectDefaultTransformer", () => {

    it("should return void", async () => {
      const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, _updateDmsObjectDefaultTransformFunction, mockStoreFileFunction);
      const result = await updateDmsObject(context, params);

      expect(result).toBe(undefined);
    });
  });

  describe("updateDmsObjectDefaultStoreFileFunction", () => {

    it("should call storeFileTemporarily correctly", async () => {

      const temporaryFileUrl = "HiItsMeTemporaryFileUrl";
      mockStoryFileTemporarily.mockResolvedValue(temporaryFileUrl);
      params.content = new ArrayBuffer(42);

      const updateDmsObject = _updateDmsObjectFactory(mockHttpRequestFunction, mockTransformFunction, updateDmsObjectDefaultStoreFileFunction);
      await updateDmsObject(context, params);

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
