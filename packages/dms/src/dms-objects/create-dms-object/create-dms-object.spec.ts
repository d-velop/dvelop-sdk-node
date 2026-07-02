import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { DmsError } from "../../utils/dms-error";
import {
  CreateDmsObjectParams,
  onResponse,
  createDmsObject,
} from "./create-dms-object";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

jest.mock("../store-file-temporarily/store-file-temporarily");

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;
const mockStoreFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

describe("createDmsObject", () => {

  let context: DvelopContext;
  let params: CreateDmsObjectParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      categoryId: "HiItsMeCategoryId",
      properties: [
        { key: "HiItsMeProperty1Key", values: ["HiItsMeProperty1Value"] },
        { key: "HiItsMeProperty2Key", values: ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"] }
      ]
    };
  });

  it("should call dvelopFetch with method POST and a JSON body", async () => {
    await createDmsObject(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m`);
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      sourceId: params.sourceId,
      sourceCategory: params.categoryId,
      sourceProperties: { properties: params.properties },
      filename: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
    });
  });

  it("should not call storeFileTemporarily when contentUri is set even if content is given", async () => {
    params.contentUri = "HiItsMeContentUri";
    params.content = new ArrayBuffer(42);

    await createDmsObject(context, params);

    expect(mockStoreFileTemporarily).not.toHaveBeenCalled();
  });

  it("should not call storeFileTemporarily when contentLocationUri is set even if content is given", async () => {
    params.contentLocationUri = "HiItsMeContentLocationUri";
    params.content = new ArrayBuffer(42);

    await createDmsObject(context, params);

    expect(mockStoreFileTemporarily).not.toHaveBeenCalled();
  });

  it("should call storeFileTemporarily and set contentLocationUri when content is given without contentUri/contentLocationUri", async () => {
    params.content = new ArrayBuffer(42);
    mockStoreFileTemporarily.mockResolvedValue("HiItsMeTemporaryUri");

    await createDmsObject(context, params);

    expect(mockStoreFileTemporarily).toHaveBeenCalledWith(context, {
      repositoryId: params.repositoryId,
      content: params.content
    });
    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).contentLocationUri).toEqual("HiItsMeTemporaryUri");
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await createDmsObject(context, params, options);

    const calledOptions = mockDvelopFetch.mock.calls[0][3];
    expect(calledOptions).toBe(options);
  });

  describe("onResponse", () => {

    const dmsObjectId = "HiItsMeDmsObjectId";

    [
      `/${dmsObjectId}`,
      `/${dmsObjectId}?`,
      `hi/i/am/an/uri/${dmsObjectId}`,
      `hi/i/am/an/uri/${dmsObjectId}?withQueryParams`,
    ].forEach(location => {
      it(`should parse location header '${location}'`, async () => {
        const response = new Response(null, { status: 201, headers: { location } });

        const transform = onResponse(params);
        const result = await transform(response);

        expect(result).toEqual({
          repositoryId: params.repositoryId,
          sourceId: params.sourceId,
          dmsObjectId,
        });
      });
    });

    it("should throw DmsError when location cannot be parsed", async () => {
      const response = new Response(null, { status: 201, headers: { location: "HiImWrong" } });
      const transform = onResponse(params);

      try {
        await transform(response);
        fail("expected throw");
      } catch (e: any) {
        expect(e).toBeInstanceOf(DmsError);
        expect(e.message).toContain("Failed to parse dmsObjectId");
        expect(e.message).toContain("HiImWrong");
      }
    });
  });
});
