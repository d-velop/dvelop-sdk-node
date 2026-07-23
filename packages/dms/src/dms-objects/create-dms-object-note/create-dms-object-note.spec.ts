import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  CreateDmsObjectNoteParams,
  onResponse,
  createDmsObjectNote,
} from "./create-dms-object-note";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("createDmsObjectNote", () => {

  let context: DvelopContext;
  let params: CreateDmsObjectNoteParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      noteText: "HiItsMeNoteText"
    };
  });

  it("should call dvelopFetch with POST and JSON body", async () => {
    await createDmsObjectNote(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe(`/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/n`);
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({ text: params.noteText });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await createDmsObjectNote(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_createDmsObjectNoteDefaultTransformFunction", () => {

    it("should resolve to undefined on 2xx", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
