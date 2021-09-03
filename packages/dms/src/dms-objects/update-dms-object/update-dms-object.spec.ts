import { AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-femporarily";
import { updateDmsObject, UpdateDmsObjectParams } from "./update-dms-object";

jest.mock("../store-file-temporarily/store-file-femporarily");
const mockStoryFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockPUT = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: Context;
let params: UpdateDmsObjectParams;
let mockTransform: any;

describe("updateDmsObject", () => {

  beforeEach(() => {

    jest.resetAllMocks();

    mockGetAxiosInstace.mockReturnValueOnce({
      put: mockPUT
    } as unknown as AxiosInstance);
    mockPUT.mockResolvedValue({});
    mockTransform = jest.fn();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };
  });

  describe("on no file", () => {

    beforeEach(() => {

      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        dmsObjectId: "HiItsMeDmsObjectId",
        alterationText: "HiItsMeAlterationText",
        properties: [
          {
            key: "HiItsMePropertyKey2",
            values: ["HiItsMePropertyValue1_1", "HiItsMePropertyValue1_2"]
          }, {
            key: "HiItsMePropertyKey2",
            values: ["HiItsMePropertyValue2_1"]
          }, {
            key: "HiItsMePropertyKey2",
            values: []
          }
        ]
      };
    });

    it("should not call storeFileTemprarily", async () => {
      await updateDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(0);
    });

    it("should do PUT correctly", async () => {
      await updateDmsObject(context, params, mockTransform);

      expect(mockPUT).toHaveBeenCalledTimes(1);
      expect(mockPUT).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        alterationText: params.alterationText,
        sourceProperties: { properties: params.properties }
      }, {
        baseURL: context.systemBaseUri,
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/hal+json",
          "Content-Type": "application/hal+json"
        },
        follows: ["repo", "dmsobjectwithmapping", "update"],
        templates: {
          "repositoryid": params.repositoryId,
          "dmsobjectid": params.dmsObjectId,
          "sourceid": params.sourceId
        }
      });
    });
  });

  describe("on file as contentLocationUri", () => {

    beforeEach(() => {
      params = params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        dmsObjectId: "HiItsMeDmsObjectId",
        alterationText: "HiItsMeAlterationText",
        fileName: "HiItsMeFileName",
        file: "HiItsMeContentLocationUri"
      };
    });

    it("should not call storeFileTemprarily", async () => {
      await updateDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(0);
    });

    it("should do POST correctly", async () => {
      await updateDmsObject(context, params, mockTransform);

      expect(mockPUT).toHaveBeenCalledTimes(1);
      expect(mockPUT).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        alterationText: params.alterationText,
        fileName: params.fileName,
        contentLocationUri: params.file
      }, {
        baseURL: context.systemBaseUri,
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/hal+json",
          "Content-Type": "application/hal+json"
        },
        follows: ["repo", "dmsobjectwithmapping", "update"],
        templates: {
          "repositoryid": params.repositoryId,
          "dmsobjectid": params.dmsObjectId,
          "sourceid": params.sourceId
        }
      });
    });
  });

  describe("on file as ArrayBuffer", () => {

    beforeEach(() => {
      params = params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        dmsObjectId: "HiItsMeDmsObjectId",
        alterationText: "HiItsMeAlterationText",
        fileName: "HiItsMeFileName",
        file: new ArrayBuffer(42)
      };
    });

    it("should call storeFileTemprarily correctly", async () => {

      await updateDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(1);
      expect(mockStoryFileTemporarily).toHaveBeenCalledWith(context, {
        repositoryId: params.repositoryId,
        file: params.file
      });
    });

    it("should do POST correctly", async () => {
      const contentLocationUri = "HiItsMeContentLocationUri";
      mockStoryFileTemporarily.mockResolvedValue(contentLocationUri);

      await updateDmsObject(context, params, mockTransform);

      expect(mockPUT).toHaveBeenCalledTimes(1);
      expect(mockPUT).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        alterationText: params.alterationText,
        fileName: params.fileName,
        contentLocationUri: contentLocationUri
      }, {
        baseURL: context.systemBaseUri,
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/hal+json",
          "Content-Type": "application/hal+json"
        },
        follows: ["repo", "dmsobjectwithmapping", "update"],
        templates: {
          "repositoryid": params.repositoryId,
          "dmsobjectid": params.dmsObjectId,
          "sourceid": params.sourceId
        }
      });
    });
  });

  it("should throw mapped error on request-error", async () => {
    const requestError: Error = new Error("HiItsMeRequestError");
    mockPUT.mockRejectedValue(requestError);

    const mappedError: Error = new Error("HiItsMeMappedError");
    mockMapRequestError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await updateDmsObject(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockTransform).toHaveBeenCalledTimes(0);
    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([400, 404], "Failed to update dmsObject", requestError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {

    const putResponse: AxiosResponse<any> = {
      data: "HiItsMePostResponseMessage"
    } as AxiosResponse;
    mockPUT.mockResolvedValue(putResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    const result = await updateDmsObject(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(putResponse, context, params);
    expect(result).toEqual(transformResult);
  });


  describe("default transform", () => {
    it("should not transform", async () => {
      const result = await updateDmsObject(context, params);
      expect(result).toBeUndefined();
    });
  });
});