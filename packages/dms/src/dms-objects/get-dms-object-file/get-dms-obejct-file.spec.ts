import { NotFoundError } from "../../utils/errors";
import { TenantContext } from "../../utils/tenant-context";
import { GetDmsObjectParams, getDmsObject } from "../get-dms-object/get-dms-object";
import { GetDmsObjectFileTransformer, getDmsObjectFile, getDmsObjectPdf } from "./get-dms-object-file";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, isAxiosError, mapAxiosError } from "../../utils/http";

jest.mock("../get-dms-object/get-dms-object");
const mockGetDmsObject = getDmsObject as jest.MockedFunction<typeof getDmsObject>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockGET = jest.fn();
const mockIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;
const mockMapAxiosError = mapAxiosError as jest.MockedFunction<typeof mapAxiosError>;

[
  {
    testContext: "getDmsObjectFile",
    call: async (context: TenantContext, params: GetDmsObjectParams, transform?: GetDmsObjectFileTransformer<any>) => getDmsObjectFile(context, params, transform),
    dmsObejectResponse: { _links: { mainblobcontent: { href: "HiItsMeHref" } } },
    notFoundErrorMessage: "Failed to get dmsObjectFile: No href for mainblobcontent indicating there is no file for this dmsObject."
  }, {
    testContext: "getDmsObjectPdf",
    call: async (context: TenantContext, params: GetDmsObjectParams, transform?: GetDmsObjectFileTransformer<any>) => getDmsObjectPdf(context, params, transform),
    dmsObejectResponse: { _links: { pdfblobcontent: { href: "HiItsMeHref" } } },
    notFoundErrorMessage: "Failed to get dmsObjectPdf: No href for pdfblobcontent indicating there is no pdf for this dmsObject."
  }
].forEach(testCase => {
  describe(`${testCase.testContext}`, () => {

    let context: TenantContext;
    let params: GetDmsObjectParams;
    let transform: GetDmsObjectFileTransformer<any>;

    beforeEach(() => {

      jest.resetAllMocks();

      context = {
        systemBaseUri: "HiItsMeSystemBaseUri",
        authSessionId: "HiItsMeAuthSessionId"
      };

      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        dmsObjectId: "HiItsMeDmsObjectId"
      };

      transform = jest.fn();

      mockGetDmsObject.mockResolvedValue({ data: testCase.dmsObejectResponse });
      mockGetAxiosInstace.mockReturnValueOnce({
        get: mockGET
      } as unknown as AxiosInstance);

      mockGET.mockResolvedValue({ data: {} });
    });

    it("should call getDmsObject correctly", async () => {
      await testCase.call(context, params, transform);
      expect(mockGetDmsObject).toHaveBeenCalledTimes(1);
      expect(mockGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
    });

    it("should not catch errors from getDmsObject", async () => {
      const error: Error = new Error("HiItsMeError");
      mockGetDmsObject.mockImplementation(() => { throw error; });

      let expectedError: Error;
      try {
        await testCase.call(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError).toBe(error);
    });

    [
      { data: null },
      { data: undefined },
      { data: {} },
      { data: { _links: null } },
      { data: { _links: undefined } },
      { data: { _links: {} } },
      { data: { _links: { irrelevant: "HiImIrrelevant" } } }
    ].forEach(dmsObj => {

      it("should throw NotFoundError when no href is given", async () => {

        mockGetDmsObject.mockResolvedValue(dmsObj);

        let expectedError: Error;
        try {
          await testCase.call(context, params, transform);
        } catch (e) {
          expectedError = e;
        }

        expect(expectedError instanceof NotFoundError).toBeTruthy();
        expect(expectedError.message).toContain(testCase.notFoundErrorMessage);
      });
    });

    it("should do GET correctly", async () => {

      await testCase.call(context, params, transform);

      expect(mockGET).toHaveBeenCalledTimes(1);
      expect(mockGET).toHaveBeenCalledWith("HiItsMeHref", expect.any(Object));

      expect(mockGET).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));

      expect(mockGET).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/octet-stream"
        })
      }));

      expect(mockGET).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        responseType: "arraybuffer"
      }));
    });

    it("should call transform", async () => {

      const response: AxiosResponse = {
        statusText: "sucess"
      } as AxiosResponse;

      mockGET.mockResolvedValue(response);

      await testCase.call(context, params, transform);

      expect(transform).toHaveBeenCalledTimes(1);
      expect(transform).toHaveBeenLastCalledWith(response, context, params);
    });

    it("should return data by default", async () => {

      const file = new ArrayBuffer(42);

      mockGET.mockResolvedValue({
        data: new ArrayBuffer(42)
      } as AxiosResponse);

      const result: ArrayBuffer = await testCase.call(context, params);

      expect(result).toEqual(file);
    });

    it("should throw mappedError on axiosError", async () => {

      const getError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockGET.mockRejectedValue(getError);

      mockIsAxiosError.mockReturnValue(true);

      const mappedError: Error = new Error("HiItsMeMappedError");
      mockMapAxiosError.mockReturnValue(mappedError);

      let expectedError: Error;
      try {
        await testCase.call(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockIsAxiosError).toHaveBeenCalledWith(getError);
      expect(mockMapAxiosError).toHaveBeenCalledTimes(1);
      expect(mockMapAxiosError).toHaveBeenCalledWith("Failed to download dmsObjectFile", getError);
      expect(expectedError).toEqual(mappedError);
    });

    it("should throw on non axiosError", async () => {

      const getError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockGET.mockRejectedValue(getError);

      mockIsAxiosError.mockReturnValue(false);

      let expectedError: Error;
      try {
        await testCase.call(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockIsAxiosError).toHaveBeenCalledWith(getError);
      expect(mockMapAxiosError).toHaveBeenCalledTimes(0);
      expect(expectedError).toEqual(getError);
      expect(expectedError.message).toContain("Failed to download dmsObjectFile");
    });
  });
});
