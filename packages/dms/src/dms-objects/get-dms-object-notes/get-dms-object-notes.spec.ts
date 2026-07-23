import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  DmsObjectNote,
  GetDmsObjectNotesParams,
  onResponse,
  getDmsObjectNotes,
} from "./get-dms-object-notes";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getDmsObjectNotes", () => {

  let context: DvelopContext;
  let params: GetDmsObjectNotesParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getDmsObjectNotes(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/n`,
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getDmsObjectNotes(context, params, options);
    expect(mockDvelopFetch).toHaveBeenCalledWith(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/n`, { method: "GET" }, options);
  });

  describe("_getDmsObjectNotesDefaultTransformFunction", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map a single note", async () => {
      const data = {
        notes: [{
          creator: { id: "HiItsMeCreatorId", displayName: "HiItsMeCreatorDisplayName" },
          text: "HiItsMeText",
          created: "2023-10-11T09:09:09.453+02:00"
        }]
      };

      const expected: DmsObjectNote[] = [{
        creator: { id: "HiItsMeCreatorId", displayName: "HiItsMeCreatorDisplayName" },
        text: "HiItsMeText",
        created: new Date("2023-10-11T09:09:09.453+02:00")
      }];

      const result = await onResponse(jsonResponse(data));
      expect(result).toEqual(expected);
    });

    it("should map empty notes list", async () => {
      const result = await onResponse(jsonResponse({ notes: [] }));
      expect(result).toEqual([]);
    });
  });
});
