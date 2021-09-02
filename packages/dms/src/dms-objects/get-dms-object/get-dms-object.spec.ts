import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { TenantContext } from "../../utils/tenant-context";
import { getDmsObject, GetDmsObjectParams } from "./get-dms-object";

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

    const data: any = {
      "_links": {
        "self": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2m/D000000123"
        },
        "mainblobcontent": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2/D000000123/v/current/b/main/c"
        },
        "editinoffice": {
          "href": "{ms-word:ofe|u|{+clientOrigin}/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2/D000000123/dav/D000000123%20(D000000123).DOCX}",
          "templated": true
        },
        "pdfblobcontent": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2/D000000123/v/current/b/p1/c"
        },
        "notes": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2m/D000000123/n"
        },
        "children": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/srm/?children_of=D000000123"
        },
        "versions": {
          "href": "/dms/r/dee1f3d3-eae8-5d9d-84d8-2d758c5ddc27/o2m/D000000123/v/"
        }
      },
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

    beforeEach(() => {
      mockGET.mockResolvedValue({ data: data });
    });

    it("should parse correctly", async () => {
      const result = await getDmsObject(context, params);
      expect(result).toHaveProperty("repositoryId", params.repositoryId);
      expect(result).toHaveProperty("sourceId", params.sourceId);
      expect(result).toHaveProperty("id", data["id"]);
      expect(result).toHaveProperty("categories", data["sourceCategories"]);
      expect(result).toHaveProperty("properties", data["sourceProperties"]);
    });
  });
});