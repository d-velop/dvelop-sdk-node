import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { TenantContext } from "../../utils/tenant-context";
import { requestDmsObjectBlob } from "../get-dms-object-file/get-dms-object-file";
import { getDmsObject, GetDmsObjectParams } from "./get-dms-object";

jest.mock("../get-dms-object-file/get-dms-object-file");
const mockRequestDmsObjectBlob = requestDmsObjectBlob as jest.MockedFunction<typeof requestDmsObjectBlob>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockGET = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: TenantContext;
let params: GetDmsObjectParams;
let mockTransform: any;

describe("getDmsObject", () => {

  beforeEach(() => {

    jest.resetAllMocks();

    mockGetAxiosInstace.mockReturnValue({
      get: mockGET
    } as unknown as AxiosInstance);
    mockGET.mockResolvedValue({ data: {} });
    mockTransform = jest.fn();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };

  });

  it("should do GET correctly", async () => {
    await getDmsObject(context, params, mockTransform);

    expect(mockGET).toHaveBeenCalledTimes(1);
    expect(mockGET).toHaveBeenCalledWith("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });
  });

  it("should throw mappedError on requestError", async () => {

    const getError: AxiosError = {
      message: "HiItsMeErrorMessage"
    } as AxiosError;
    mockGET.mockRejectedValue(getError);

    const mappedError: Error = new Error("HiItsMeMappedError");
    mockMapRequestError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await getDmsObject(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([400, 404], "Failed to get dmsObject", getError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {

    const getResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockGET.mockResolvedValue(getResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    await getDmsObject(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(getResponse, context, params);
  });



  describe("default transform", () => {

    it("should parse properties correctly", async () => {

      const data: any = {
        "id": "HiItsMeId",
        "sourceProperties": [
          {
            "key": "myprop1_ID",
            "value": "value of property 1"
          },
          {
            "key": "myprop2_ID",
            "value": "value of property 2 in row 2",
            "values": {
              "2": "value of property 2 in row 2",
              "4": "value of property 2 in row 4"
            }
          }
        ],
        "sourceCategories": ["mycategory2_ID"]
      };

      mockGET.mockResolvedValue({ data: data });

      const result = await getDmsObject(context, params);
      expect(result).toHaveProperty("repositoryId", params.repositoryId);
      expect(result).toHaveProperty("sourceId", params.sourceId);
      expect(result).toHaveProperty("id", data["id"]);
      expect(result).toHaveProperty("categories", data["sourceCategories"]);
      expect(result).toHaveProperty("properties", data["sourceProperties"]);
    });

    [
      { "_links": {} },
      { "_links": { "irrelevant": { "href": "HiImIrrelevant" } } },
      { "_links": { "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
    ].forEach(testCase => {
      it("should not provide getFile", async () => {
        mockGET.mockResolvedValue({ data: testCase });
        const result = await getDmsObject(context, params);
        expect(result.getFile).toBeUndefined();
        expect(mockRequestDmsObjectBlob).toHaveBeenCalledTimes(0);
      });
    });

    [
      null,
      undefined,
      {},
      { "_links": null },
      { "_links": undefined },
      { "_links": {} },
      { "_links": { "irrelevant": { "href": "HiImIrrelevant" } } },
      { "_links": { "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" } } },
    ].forEach(testCase => {
      it("should not provide getPdf", async () => {
        mockGET.mockResolvedValue({ data: testCase });
        const result = await getDmsObject(context, params);
        expect(result.getPdf).toBeUndefined();
        expect(mockRequestDmsObjectBlob).toHaveBeenCalledTimes(0);
      });
    });

    [
      { "_links": { "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" } } },
      { "_links": { "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" }, "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
      { "_links": { "irrelevant": { "href": "HiImIrrelevant" }, "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" }, "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
    ].forEach(testCase => {
      it("should provide correct function for getFile", async () => {

        mockGET.mockResolvedValue({ data: testCase });

        const fileResponse: AxiosResponse<ArrayBuffer> = { data: new ArrayBuffer(42) } as AxiosResponse;
        mockRequestDmsObjectBlob.mockResolvedValue(fileResponse);

        const result = await getDmsObject(context, params);
        const file = await result.getFile();

        expect(mockRequestDmsObjectBlob).toHaveBeenCalledTimes(1);
        expect(mockRequestDmsObjectBlob).toHaveBeenCalledWith(context, testCase._links.mainblobcontent.href);
        expect(file).toEqual(fileResponse.data);
      });

    });

    [
      { "_links": { "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
      { "_links": { "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" }, "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
      { "_links": { "irrelevant": { "href": "HiImIrrelevant" }, "mainblobcontent": { "href": "HiItsMeMainBlobContentHref" }, "pdfblobcontent": { "href": "HiItsMePdfBlobContentHref" } } },
    ].forEach(testCase => {

      it("should provide correct function for getPdf", async () => {

        mockGET.mockResolvedValue({ data: testCase });

        const fileResponse: AxiosResponse<ArrayBuffer> = { data: new ArrayBuffer(42) } as AxiosResponse;
        mockRequestDmsObjectBlob.mockResolvedValue(fileResponse);

        const result = await getDmsObject(context, params);
        const file = await result.getPdf();

        expect(mockRequestDmsObjectBlob).toHaveBeenCalledTimes(1);
        expect(mockRequestDmsObjectBlob).toHaveBeenCalledWith(context, testCase._links.pdfblobcontent.href);
        expect(file).toEqual(fileResponse.data);
      });
    });
  });


});