import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  UpdateDmsObjectStatusParams,
  onResponse,
  updateDmsObjectStatus,
} from "./update-dms-object-status";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("updateDmsObjectStatus", () => {

  let context: DvelopContext;
  let params: UpdateDmsObjectStatusParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      status: "Processing"
    };
  });

  it("should call dvelopFetch with method PUT and a body containing property_state", async () => {
    await updateDmsObjectStatus(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/v/current`);
    expect(calledInit).toMatchObject({ method: "PUT" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({
      sourceId: `/dms/r/${params.repositoryId}/source`,
      sourceProperties: {
        properties: [{ key: "property_state", values: ["Processing"] }]
      }
    });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should include property_editor when editor is set", async () => {
    params.editor = "HiItsMeEditor";
    await updateDmsObjectStatus(context, params);

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    const body = JSON.parse(calledInit!.body as string);
    expect(body.sourceProperties.properties).toEqual([
      { key: "property_state", values: ["Processing"] },
      { key: "property_editor", values: ["HiItsMeEditor"] }
    ]);
  });

  it("should include alterationText when set", async () => {
    params.alterationText = "HiItsMeAlterationText";
    await updateDmsObjectStatus(context, params);

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    const body = JSON.parse(calledInit!.body as string);
    expect(body.alterationText).toEqual("HiItsMeAlterationText");
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await updateDmsObjectStatus(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_updateDmsObjectStatusDefaultTransformFunction", () => {
    it("should resolve to undefined on 2xx", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
