import { DmsError } from "../../utils/errors";
import { AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-femporarily";
import { createDmsObject, CreateDmsObjectParams } from "./create-dms-object";

jest.mock("../store-file-temporarily/store-file-femporarily");
const mockStoryFileTemporarily = storeFileTemporarily as jest.MockedFunction<typeof storeFileTemporarily>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockPOST = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

const dmsObjectId = "HiItsMeDmsObjectId";
let context: Context;
let params: CreateDmsObjectParams;
let mockTransform: any;

beforeEach(() => {

  jest.resetAllMocks();

  mockGetAxiosInstace.mockReturnValueOnce({
    post: mockPOST
  } as unknown as AxiosInstance);
  mockPOST.mockResolvedValue({ headers: { location: `/${dmsObjectId}` } });
  mockTransform = jest.fn();

  context = {
    systemBaseUri: "HiItsMeSystemBaseUri",
    authSessionId: "HiItsMeAuthSessionId"
  };

});

describe("createDmsObject", () => {

  describe("on no file", () => {

    beforeEach(() => {
      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        categoryId: "HiItsMeCategoryId",
        properties: [
          {
            key: "HiItsMeProperty1Key",
            values: ["HiItsMeProperty1Value"]
          },
          {
            key: "HiItsMeProperty2Key",
            values: ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"]
          }
        ]
      };
    });

    it("should not call storeFileTemprarily", async () => {
      await createDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(0);
    });

    it("should do POST correctly", async () => {
      await createDmsObject(context, params, mockTransform);

      expect(mockPOST).toHaveBeenCalledTimes(1);
      expect(mockPOST).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        sourceCategory: params.categoryId,
        sourceProperties: {
          properties: params.properties
        }
      }, {
        baseURL: context.systemBaseUri,
        follows: ["repo", "dmsobjectwithmapping"],
        templates: { repositoryid: params.repositoryId },
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Content-Type": "application/hal+json",
          "Accept": "application/hal+json"
        }
      });
    });
  });

  describe("on contentUri and contentLocationUri", () => {

    beforeEach(() => {
      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        categoryId: "HiItsMeCategoryId",
        fileName: "HiItsMeFileName",
        contentUri: "HiItsmeContentUri",
        contentLocationUri: "HiItsmeContentLocationUri",
      };
    });

    it("should not call storeFileTemprarily", async () => {
      await createDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(0);
    });

    it("should do POST correctly", async () => {
      await createDmsObject(context, params, mockTransform);

      expect(mockPOST).toHaveBeenCalledTimes(1);
      expect(mockPOST).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        sourceCategory: params.categoryId,
        sourceProperties: {
          properties: params.properties
        },
        fileName: params.fileName,
        contentUri: "HiItsmeContentUri",
        contentLocationUri: "HiItsmeContentLocationUri",
      }, {
        baseURL: context.systemBaseUri,
        follows: ["repo", "dmsobjectwithmapping"],
        templates: { repositoryid: params.repositoryId },
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Content-Type": "application/hal+json",
          "Accept": "application/hal+json"
        }
      });
    });
  });

  describe("on file as ArrayBuffer", () => {

    const temporaryFileLocation = "HiItsMeTemporaryFileLocation";

    beforeEach(() => {

      mockStoryFileTemporarily.mockResolvedValue(temporaryFileLocation);

      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        categoryId: "HiItsMeCategoryId",
        fileName: "HiItsMeFileName",
        content: new ArrayBuffer(42)
      };
    });

    it("should call storeFileTemprarily correctly", async () => {

      await createDmsObject(context, params, mockTransform);
      expect(mockStoryFileTemporarily).toHaveBeenCalledTimes(1);
      expect(mockStoryFileTemporarily).toHaveBeenCalledWith(context, {
        repositoryId: params.repositoryId,
        file: params.content
      });
    });

    it("should do POST correctly", async () => {
      await createDmsObject(context, params, mockTransform);

      expect(mockPOST).toHaveBeenCalledTimes(1);
      expect(mockPOST).toHaveBeenCalledWith("/dms", {
        sourceId: params.sourceId,
        sourceCategory: params.categoryId,
        sourceProperties: {
          properties: params.properties
        },
        fileName: params.fileName,
        contentLocationUri: temporaryFileLocation
      }, {
        baseURL: context.systemBaseUri,
        follows: ["repo", "dmsobjectwithmapping"],
        templates: { repositoryid: params.repositoryId },
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Content-Type": "application/hal+json",
          "Accept": "application/hal+json"
        }
      });
    });
  });

  it("should throw mapped error on request-error", async () => {
    const requestError: Error = new Error("HiItsMeRequestError");
    const mappedError: Error = new Error("HiItsMeMappedError");
    mockPOST.mockRejectedValue(requestError);
    mockMapRequestError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await createDmsObject(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockTransform).toHaveBeenCalledTimes(0);
    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([400], "Failed to create dmsObject", requestError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {

    const postResponse: AxiosResponse<any> = {
      data: "HiItsMePostResponseMessage"
    } as AxiosResponse;
    mockPOST.mockResolvedValue(postResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    const result = await createDmsObject(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(postResponse, context, params);
    expect(result).toEqual(transformResult);
  });

  describe("default transform", () => {

    [
      `/${dmsObjectId}`,
      `/${dmsObjectId}?`,
      `hi/i/am/an/uri/${dmsObjectId}`,
      `hi/i/am/an/uri/${dmsObjectId}?withQueryParams`,
    ].forEach(testCase => {
      it(`should return parse ${testCase}`, async () => {
        mockPOST.mockResolvedValue({ headers: { location: testCase } });

        const result = await createDmsObject(context, params);

        expect(result).toHaveProperty("repositoryId", params.repositoryId);
        expect(result).toHaveProperty("sourceId", params.sourceId);
        expect(result).toHaveProperty("dmsObjectId", dmsObjectId);
      });
    });

    it("should throw on parse error", async () => {
      mockPOST.mockResolvedValue({ headers: { location: "HiImWrong" } });

      let expectedError: Error;
      try {
        await createDmsObject(context, params);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof DmsError).toBeTruthy();
      expect(expectedError.message).toContain("Failed to create dmsObject");
      expect(expectedError.message).toContain("Failed to parse dmsObjectId from 'HiImWrong'");
    });
  });
});
