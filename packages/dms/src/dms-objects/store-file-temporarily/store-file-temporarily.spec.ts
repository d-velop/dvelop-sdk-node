import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  StoreFileTemporarilyParams,
  onResponse,
  storeFileTemporarily,
} from "./store-file-temporarily";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("storeFileTemporarily", () => {

  let context: DvelopContext;
  let params: StoreFileTemporarilyParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { repositoryId: "HiItsMeRepositoryId", content: new ArrayBuffer(42) };
  });

  it("should call dvelopFetch with method POST, octet-stream Content-Type and content body", async () => {
    await storeFileTemporarily(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/blob/chunk`);
    expect(calledInit).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: params.content
    });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await storeFileTemporarily(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should return the location header", async () => {
      const response = new Response(null, { status: 201, headers: { location: "HiItsMeLocation" } });
      const result = await onResponse(response);
      expect(result).toEqual("HiItsMeLocation");
    });

    it("should return empty string when location is missing", async () => {
      const response = new Response(null, { status: 201 });
      const result = await onResponse(response);
      expect(result).toEqual("");
    });
  });
});
