import { DvelopContext } from "@dvelop-sdk/core";
import {
  _getDmsObjectNotesDefaultTransformFunction,
  _getDmsObjectNotesFactory, DmsObjectNotes,
  GetDmsObjectNotesParams
} from "./get-dms-object-notes";
import { HttpResponse } from "../../utils/http";

describe("getDmsObjectNotes", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetDmsObjectNotesParams;

  beforeEach(() => {
    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };
  });

  it("should make correct request", async () => {
    const getDmsObjectNotes = _getDmsObjectNotesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getDmsObjectNotes(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "notes"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {
    const response: HttpResponse = { data: {
      notes: [{
        creator: {
          id: "HiItsMeCreatorId",
          displayName: "HiItsMeCreatorDisplayName"
        },
        text: "HiItsMeText",
        created: "2023-10-11T09:09:09.453+02:00"
      }]
    } } as HttpResponse;

    const transformResult: DmsObjectNotes = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      notes: [{
        creator: {
          id: "HiItsMeCreatorId",
          displayName: "HiItsMeCreatorDisplayName"
        },
        text: "HiItsMeText",
        created: new Date("2023-10-11T09:09:09.453+02:00")
      }]
    };

    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getDmsObjectNotes = _getDmsObjectNotesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getDmsObjectNotes(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getDmsObjectNotesDefaultTransformFunction", () => {
    it("should return response DmsObjectNotes with single note", async () => {
      const response: HttpResponse = { data: {
        notes: [{
          creator: {
            id: "HiItsMeCreatorId",
            displayName: "HiItsMeCreatorDisplayName"
          },
          text: "HiItsMeText",
          created: "2023-10-11T09:09:09.453+02:00"
        }]
      } } as HttpResponse;

      const expectedResult: DmsObjectNotes = {
        repositoryId: "HiItsMeRepositoryId",
        dmsObjectId: "HiItsMeDmsObjectId",
        notes: [{
          creator: {
            id: "HiItsMeCreatorId",
            displayName: "HiItsMeCreatorDisplayName"
          },
          text: "HiItsMeText",
          created: new Date("2023-10-11T09:09:09.453+02:00")
        }]
      };

      mockHttpRequestFunction.mockResolvedValue(response);
      const getDmsObjectNotes = _getDmsObjectNotesFactory(mockHttpRequestFunction, _getDmsObjectNotesDefaultTransformFunction);
      const result = await getDmsObjectNotes(context, params);

      expect(result).toEqual(expectedResult);
    });

    it("should return response DmsObjectNotes without notes when dmsObject has no notes", async () => {
      const response: HttpResponse = { data: {
        notes: []
      } } as HttpResponse;

      const expectedResult: any = {
        repositoryId: "HiItsMeRepositoryId",
        dmsObjectId: "HiItsMeDmsObjectId",
        notes: []
      };

      mockHttpRequestFunction.mockResolvedValue(response);
      const getDmsObjectNotes = _getDmsObjectNotesFactory(mockHttpRequestFunction, _getDmsObjectNotesDefaultTransformFunction);
      const result = await getDmsObjectNotes(context, params);

      expect(result).toEqual(expectedResult);
    });
  });
});
