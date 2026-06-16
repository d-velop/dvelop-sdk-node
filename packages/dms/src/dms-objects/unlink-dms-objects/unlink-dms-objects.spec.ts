import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  UnlinkDmsObjectsParams,
  onResponse,
  unlinkDmsObjects,
} from "./unlink-dms-objects";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("unlinkDmsObjects", () => {

  let context: DvelopContext;
  let params: UnlinkDmsObjectsParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      parentDmsObjectId: "HiItsMeParentDmsObjectId",
      childDmsObjectsId: "HiItsMeChildDmsObjectId"
    };
  });

  it("should call dvelopFetch with method DELETE", async () => {
    await unlinkDmsObjects(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children/${params.childDmsObjectsId}`,
      { method: "DELETE" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await unlinkDmsObjects(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_unlinkDmsObjectsDefaultTransformFunction", () => {
    it("should resolve to undefined on 2xx", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
