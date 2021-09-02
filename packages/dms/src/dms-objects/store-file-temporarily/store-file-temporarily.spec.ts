import { TenantContext } from "../../utils/tenant-context";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { storeFileTemporarily, StoreFileTemporarilyParams, StoreFileTemporarilyTransformer } from "./store-file-femporarily";

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockPOST = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: TenantContext;
let params: StoreFileTemporarilyParams;
let mockTransform: StoreFileTemporarilyTransformer<any>;

describe("storeFileTemporarily", () => {

  beforeEach(() => {

    jest.resetAllMocks();

    mockGetAxiosInstace.mockReturnValueOnce({
      post: mockPOST
    } as unknown as AxiosInstance);

    mockPOST.mockResolvedValue({ headers: { "location": "HiItsMeLocation" } });
    mockTransform = jest.fn();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      file: new ArrayBuffer(42)
    };
  });


  it("should do POST correctly", async () => {
    await storeFileTemporarily(context, params, mockTransform);

    expect(mockPOST).toHaveBeenCalledTimes(1);
    expect(mockPOST).toHaveBeenCalledWith("/dms", params.file, expect.objectContaining({
      baseURL: context.systemBaseUri,
      headers: expect.objectContaining({
        "Authorization": `Bearer ${context.authSessionId}`,
        "Content-Type": "application/octet-stream"
      }),
      follows: ["repo", "chunkedupload"],
      templates: expect.objectContaining({
        "repositoryid": params.repositoryId
      })
    }));
  });

  it("should throw mappedError on requestError", async () => {

    const postError: AxiosError = {
      message: "HiItsMeErrorMessage"
    } as AxiosError;
    mockPOST.mockRejectedValue(postError);

    const mappedError: Error = new Error("HiItsMeMappedError");
    mockMapRequestError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await storeFileTemporarily(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([400], "Failed to store file temporarily", postError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {
    const postResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockPOST.mockResolvedValue(postResponse);

    await storeFileTemporarily(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(postResponse, context, params);
  });

  describe("default transform", () => {
    it("should return location-header", async () => {

      const location = "HiItsMeLocation";
      const postResponse: AxiosResponse<any> = {
        headers: { "location": location }
      } as AxiosResponse;
      mockPOST.mockResolvedValue(postResponse);

      const result = await storeFileTemporarily(context, params);
      expect(result).toEqual(location);
    });
  });
});