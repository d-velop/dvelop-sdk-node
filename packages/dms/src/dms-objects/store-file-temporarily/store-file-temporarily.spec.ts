describe("storeFileTemporarily", () => {

});

import { TenantContext } from "../../utils/tenant-context";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, isAxiosError, mapAxiosError } from "../../utils/http";
import { storeFileTemporarily, StoreFileTemporarilyParams, StoreFileTemporarilyTransformer } from "./store-file-femporarily";

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockPOST = jest.fn();
const mockIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;
const mockMapAxiosError = mapAxiosError as jest.MockedFunction<typeof mapAxiosError>;

describe("deleteCurrentDmsObjectVersion", () => {

  let context: TenantContext;
  let params: StoreFileTemporarilyParams;
  let transform: StoreFileTemporarilyTransformer<any>;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      file: new ArrayBuffer(42)
    };

    transform = jest.fn();

    mockGetAxiosInstace.mockReturnValueOnce({
      post: mockPOST
    } as unknown as AxiosInstance);

    mockPOST.mockResolvedValue({ headers: { "location": "HiItsMeLocation" } });
  });


  it("should do POST correctly", async () => {
    await storeFileTemporarily(context, params, transform);

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

  it("should call transform", async () => {

    const postResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockPOST.mockResolvedValue(postResponse);

    await storeFileTemporarily(context, params, transform);

    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledWith(postResponse, context, params);
  });

  it("should return location on default transform", async () => {

    const location = "HiItsMeLocation";
    const postResponse: AxiosResponse<any> = {
      headers: {"location": location}
    } as AxiosResponse;
    mockPOST.mockResolvedValue(postResponse);

    const result = await storeFileTemporarily(context, params);
    expect(result).toEqual(location);
  });


  it("should throw mappedError on axiosError", async () => {

    const postError: AxiosError = {
      message: "HiItsMeErrorMessage"
    } as AxiosError;
    mockPOST.mockRejectedValue(postError);

    mockIsAxiosError.mockReturnValue(true);

    const mappedError: Error = new Error("HiItsMeMappedError");
    mockMapAxiosError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await storeFileTemporarily(context, params, transform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
    expect(mockIsAxiosError).toHaveBeenCalledWith(postError);
    expect(mockMapAxiosError).toHaveBeenCalledTimes(1);
    expect(mockMapAxiosError).toHaveBeenCalledWith("Failed to store file temporarily", postError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should throw on non axiosError", async () => {

    const postError: AxiosError = {
      message: "HiItsMeErrorMessage"
    } as AxiosError;
    mockPOST.mockRejectedValue(postError);

    mockIsAxiosError.mockReturnValue(false);

    let expectedError: Error;
    try {
      await storeFileTemporarily(context, params, transform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
    expect(mockIsAxiosError).toHaveBeenCalledWith(postError);
    expect(mockMapAxiosError).toHaveBeenCalledTimes(0);
    expect(expectedError).toEqual(postError);
    expect(expectedError.message).toContain("Failed to store file temporarily");
  });
});

