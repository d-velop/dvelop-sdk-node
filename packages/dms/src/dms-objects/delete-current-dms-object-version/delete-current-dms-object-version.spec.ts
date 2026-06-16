import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  DeleteCurrentDmsObjectVersionParams,
  onResponse,
  deleteCurrentDmsObjectVersion,
} from "./delete-current-dms-object-version";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("deleteCurrentDmsObjectVersion", () => {

  let context: DvelopContext;
  let params: DeleteCurrentDmsObjectVersionParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      reason: "HiItsMeReason"
    };
  });

  it("should call dvelopFetch with method DELETE and reason body", async () => {
    await deleteCurrentDmsObjectVersion(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}`);
    expect(calledInit).toMatchObject({ method: "DELETE" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({ reason: params.reason });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await deleteCurrentDmsObjectVersion(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_deleteCurrentDmsObjectVersionDefaultTransformFunction", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    [
      { name: "no body", make: () => new Response(null, { status: 204 }), expected: true },
      { name: "no _links", make: () => jsonResponse({}), expected: true },
      { name: "empty _links", make: () => jsonResponse({ _links: {} }), expected: true },
      { name: "unrelated _links", make: () => jsonResponse({ _links: { irrelevant: { href: "x" } } }), expected: true },
      { name: "delete link", make: () => jsonResponse({ _links: { delete: { href: "x" } } }), expected: false },
      { name: "deleteWithReason link", make: () => jsonResponse({ _links: { deleteWithReason: { href: "x" } } }), expected: false },
      { name: "both delete links", make: () => jsonResponse({ _links: { delete: { href: "x" }, deleteWithReason: { href: "y" } } }), expected: false },
    ].forEach(testCase => {
      it(`should return ${testCase.expected} on ${testCase.name}`, async () => {
        const result = await onResponse(testCase.make());
        expect(result).toBe(testCase.expected);
      });
    });
  });
});
