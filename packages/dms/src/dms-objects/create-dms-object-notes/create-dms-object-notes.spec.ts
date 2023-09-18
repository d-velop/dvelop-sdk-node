import {DvelopContext} from "@dvelop-sdk/core";
import {
  _createDmsObjectNotesDefaultTransformFunction,
  _createDmsObjectNotesFactory,
  CreateDmsObjectNotesParams
} from "./create-dms-object-notes";
import {HttpResponse} from "../../utils/http";

describe("createDmsObjectNotes", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: CreateDmsObjectNotesParams;

  beforeEach(() => {
    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      noteText: "HiItsMeNoteText"
    };
  });

  it("should make correct request", async () => {
    const createDmsObjectNotes = _createDmsObjectNotesFactory(mockHttpRequestFunction, mockTransformFunction);
    await createDmsObjectNotes(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "notes"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "text": params.noteText
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {
    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const createDmsObjectNotes = _createDmsObjectNotesFactory(mockHttpRequestFunction, mockTransformFunction);
    await createDmsObjectNotes(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("createDmsObjectNotesDefaultTransformFunction", function () {
    it("should map with values for all properties", async() => {
      const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);
      mockTransformFunction.mockReturnValue(params);

      const createDmsObjectNotes = _createDmsObjectNotesFactory(mockHttpRequestFunction, _createDmsObjectNotesDefaultTransformFunction);
      const result: CreateDmsObjectNotesParams = await createDmsObjectNotes(context, params);

      expect(result).toHaveProperty("repositoryId", params.repositoryId);
      expect(result).toHaveProperty("dmsObjectId", params.dmsObjectId);
      expect(result).toHaveProperty("noteText", params.noteText);
    });
  });
});
