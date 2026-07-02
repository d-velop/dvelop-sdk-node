import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  LinkDmsObjectsParams,
  onResponse,
  linkDmsObjects,
} from "./link-dms-objects";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("linkDmsObjects", () => {

  let context: DvelopContext;
  let params: LinkDmsObjectsParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      parentDmsObjectId: "HiItsMeDmsObjectId",
      childDmsObjectsIds: ["HiItsMeChildDmsObjectId1", "HiItsMeChildDmsObjectId2"]
    };
  });

  it("should call dvelopFetch with method POST and dmsObjectIds body", async () => {
    await linkDmsObjects(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children`);
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({ dmsObjectIds: params.childDmsObjectsIds });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await linkDmsObjects(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_linkDmsObjectsDefaultTransformFunction", () => {
    it("should resolve to undefined on 2xx", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
