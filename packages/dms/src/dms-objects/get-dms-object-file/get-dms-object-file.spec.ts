import { DvelopContext, dvelopFetch, NotFoundError } from "@dvelop-sdk/core";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { onResponse, getDmsObjectMainFile, getDmsObjectPdfFile } from "./get-dms-object-file";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

const metadataUrl = (params: GetDmsObjectParams) =>
  `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}?sourceid=${params.sourceId}`;

[
  { name: "getDmsObjectMainFile", fn: getDmsObjectMainFile, linkName: "mainblobcontent" },
  { name: "getDmsObjectPdfFile", fn: getDmsObjectPdfFile, linkName: "pdfblobcontent" },
].forEach(testCase => {

  describe(testCase.name, () => {

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

    it("should call dvelopFetch to get metadata, then fetch file with octet-stream Accept header", async () => {
      const href = "HiItsMeHref";
      mockDvelopFetch.mockResolvedValueOnce(href);

      await testCase.fn(context, params);

      expect(mockDvelopFetch).toHaveBeenCalledTimes(2);
      expect(mockDvelopFetch).toHaveBeenNthCalledWith(1,
        context,
        metadataUrl(params),
        { method: "GET" },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
      expect(mockDvelopFetch).toHaveBeenNthCalledWith(2,
        context,
        href,
        { method: "GET", headers: { "Accept": "application/octet-stream" } },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
    });

    it("should extract link href from metadata JSON response", async () => {
      const linkHref = "HiItsMeLinkHref";
      mockDvelopFetch.mockImplementationOnce(async (_ctx, _url, _init, opts: any) => {
        const response = new Response(JSON.stringify({
          _links: { [testCase.linkName]: { href: linkHref } }
        }), { status: 200, headers: { "Content-Type": "application/json" } });
        return opts.onResponse(response);
      });

      await testCase.fn(context, params);

      expect(mockDvelopFetch).toHaveBeenNthCalledWith(2,
        context,
        linkHref,
        { method: "GET", headers: { "Accept": "application/octet-stream" } },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
    });

    it("should throw NotFoundError when link is absent from metadata", async () => {
      mockDvelopFetch.mockResolvedValueOnce(undefined);

      try {
        await testCase.fn(context, params);
        fail("expected throw");
      } catch (e: any) {
        expect(e).toBeInstanceOf(NotFoundError);
        expect(e.message).toContain(params.dmsObjectId);
        expect(e.message).toContain(params.repositoryId);
      }
    });

    it("should rewrap NotFoundError from metadata fetch", async () => {
      mockDvelopFetch.mockRejectedValueOnce(new NotFoundError("inner", undefined));

      try {
        await testCase.fn(context, params);
        fail("expected throw");
      } catch (e: any) {
        expect(e).toBeInstanceOf(NotFoundError);
        expect(e.message).toContain(params.dmsObjectId);
        expect(e.message).toContain(params.repositoryId);
      }
    });

    it("should rewrap NotFoundError from file fetch", async () => {
      mockDvelopFetch.mockResolvedValueOnce("HiItsMeHref");
      mockDvelopFetch.mockRejectedValueOnce(new NotFoundError("inner", undefined));

      try {
        await testCase.fn(context, params);
        fail("expected throw");
      } catch (e: any) {
        expect(e).toBeInstanceOf(NotFoundError);
        expect(e.message).toContain(params.dmsObjectId);
        expect(e.message).toContain(params.repositoryId);
      }
    });

    it("should rethrow unknown errors", async () => {
      const error = new Error("HiItsMeError");
      mockDvelopFetch.mockRejectedValueOnce(error);
      await expect(testCase.fn(context, params)).rejects.toBe(error);
    });

    it("should forward caller-supplied options to file fetch", async () => {
      const href = "HiItsMeHref";
      mockDvelopFetch.mockResolvedValueOnce(href);
      const options = { onResponse: jest.fn() };

      await testCase.fn(context, params, options);

      expect(mockDvelopFetch).toHaveBeenNthCalledWith(2,
        context,
        href,
        { method: "GET", headers: { "Accept": "application/octet-stream" } },
        options
      );
    });

    it("should forward initOverwrite to metadata fetch", async () => {
      const href = "HiItsMeHref";
      mockDvelopFetch.mockResolvedValueOnce(href);
      const initOverwrite = { headers: { "X-Custom": "value" } };
      const options = { onResponse: jest.fn(), initOverwrite };

      await testCase.fn(context, params, options);

      expect(mockDvelopFetch).toHaveBeenNthCalledWith(1,
        context,
        metadataUrl(params),
        { method: "GET" },
        expect.objectContaining({ initOverwrite })
      );
    });
  });
});

describe("onResponse", () => {

  it("should return ArrayBuffer body on 2xx", async () => {
    const buf = new ArrayBuffer(42);
    const response = new Response(buf, { status: 200 });
    const result = await onResponse(response);
    expect(result.byteLength).toBe(42);
  });

  it("should throw NotFoundError on 404", async () => {
    const response = new Response(null, { status: 404 });
    await expect(onResponse(response)).rejects.toBeInstanceOf(NotFoundError);
  });
});
