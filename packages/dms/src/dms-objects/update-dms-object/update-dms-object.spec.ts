import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  UpdateDmsObjectParams,
  onResponse,
  updateDmsObject,
} from "./update-dms-object";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

jest.mock("../store-file-temporarily/store-file-temporarily");

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;
const mockStoreFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

describe("updateDmsObject", () => {

  let context: DvelopContext;
  let params: UpdateDmsObjectParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      alterationText: "HiItsMeAlterationText",
      categoryId: "HiItsMeCategoryId",
      properties: [
        { key: "HiItsMeProperty1Key", values: ["HiItsMeProperty1Value"] },
        { key: "HiItsMeProperty2Key", values: ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"] }
      ]
    };
  });

  it("should call dvelopFetch with method PUT and a JSON body", async () => {
    await updateDmsObject(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}`);
    expect(calledInit).toMatchObject({ method: "PUT" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      sourceId: params.sourceId,
      alterationText: params.alterationText,
      sourceCategory: params.categoryId,
      sourceProperties: { properties: params.properties },
      filename: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
    });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should not call storeFileTemporarily when contentUri is set", async () => {
    params.contentUri = "HiItsMeContentUri";
    params.content = new ArrayBuffer(42);

    await updateDmsObject(context, params);
    expect(mockStoreFileTemporarily).not.toHaveBeenCalled();
  });

  it("should not call storeFileTemporarily when contentLocationUri is set", async () => {
    params.contentLocationUri = "HiItsMeContentLocationUri";
    params.content = new ArrayBuffer(42);

    await updateDmsObject(context, params);
    expect(mockStoreFileTemporarily).not.toHaveBeenCalled();
  });

  it("should call storeFileTemporarily and set contentLocationUri when content is given", async () => {
    params.content = new ArrayBuffer(42);
    mockStoreFileTemporarily.mockResolvedValue("HiItsMeTemporaryUri");

    await updateDmsObject(context, params);

    expect(mockStoreFileTemporarily).toHaveBeenCalledWith(context, { repositoryId: params.repositoryId, content: params.content });
    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).contentLocationUri).toEqual("HiItsMeTemporaryUri");
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await updateDmsObject(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_updateDmsObjectDefaultTransformFunction", () => {
    it("should resolve to undefined on 2xx", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });

});
