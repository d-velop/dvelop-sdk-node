import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import * as index from "../../index";
import { TenantContext, GetDmsObjectParams, GetDmsObjectFileTransformer } from "../../index";
import { NotFoundError } from "../../utils/errors";
import { getDmsObjectFile, getDmsObjectPdf } from "./get-dms-object-file";

jest.mock("../../index");
jest.mock("../../utils/http");
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

    const mockedGetDmsObject = jest.fn();
    const mockedAxiosGet = jest.fn();
    const mockedIsAxiosError = jest.fn();
    const mockedMapAxiosError = jest.fn();

    let context: TenantContext;
    let params: GetDmsObjectParams;
    let transform: GetDmsObjectFileTransformer<any>;

    beforeAll(() => {
      jest.spyOn(index, "getDmsObject").mockImplementation(mockedGetDmsObject);
      jest.spyOn(index._http, "getAxiosInstance").mockReturnValue({ get: mockedAxiosGet } as unknown as AxiosInstance);
      jest.spyOn(index._http, "isAxiosError").mockImplementation(mockedIsAxiosError);
      jest.spyOn(index._http, "mapAxiosError").mockImplementation(mockedMapAxiosError);
    });

    beforeEach(() => {

      mockedGetDmsObject.mockReset();
      mockedAxiosGet.mockReset();
      mockedIsAxiosError.mockReset();
      mockedMapAxiosError.mockReset();

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

      mockedGetDmsObject.mockResolvedValue({ data: testCase.dmsObejectResponse });
      mockedAxiosGet.mockResolvedValue({ data: {} });
    });

    it("should call getDmsObject correctly", async () => {
      await testCase.call(context, params, transform);
      expect(mockedGetDmsObject).toHaveBeenCalledTimes(1);
      expect(mockedGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
    });

    it("should not catch errors from getDmsObject", async () => {
      const error: Error = new Error("HiItsMeError");
      mockedGetDmsObject.mockImplementation(() => { throw error; });

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

        mockedGetDmsObject.mockResolvedValue(dmsObj);

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

      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
      expect(mockedAxiosGet).toHaveBeenCalledWith("HiItsMeHref", expect.any(Object));

      expect(mockedAxiosGet).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));

      expect(mockedAxiosGet).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/octet-stream"
        })
      }));

      expect(mockedAxiosGet).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        responseType: "arraybuffer"
      }));
    });

    it("should call transform", async () => {

      const response: AxiosResponse = {
        statusText: "sucess"
      } as AxiosResponse;

      mockedAxiosGet.mockResolvedValue(response);

      await testCase.call(context, params, transform);

      expect(transform).toHaveBeenCalledTimes(1);
      expect(transform).toHaveBeenLastCalledWith(response, context, params);
    });

    it("should return data by default", async () => {

      const file = new ArrayBuffer(42);

      mockedAxiosGet.mockResolvedValue({
        data: new ArrayBuffer(42)
      } as AxiosResponse);

      const result: ArrayBuffer = await testCase.call(context, params);

      expect(result).toEqual(file);
    });

    it("should throw mappedError on axiosError", async () => {

      const getError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockedAxiosGet.mockRejectedValue(getError);

      mockedIsAxiosError.mockReturnValue(true);

      const mappedError: Error = new Error("HiItsMeMappedError");
      mockedMapAxiosError.mockReturnValue(mappedError);

      let expectedError: Error;
      try {
        await testCase.call(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockedIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedIsAxiosError).toHaveBeenCalledWith(getError);
      expect(mockedMapAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedMapAxiosError).toHaveBeenCalledWith("Failed to download dmsObjectFile", getError);
      expect(expectedError).toEqual(mappedError);
    });

    it("should throw on non axiosError", async () => {

      const deleteError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockedAxiosGet.mockRejectedValue(deleteError);

      mockedIsAxiosError.mockReturnValue(false);

      let expectedError: Error;
      try {
        await testCase.call(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockedIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedIsAxiosError).toHaveBeenCalledWith(deleteError);
      expect(mockedMapAxiosError).toHaveBeenCalledTimes(0);
      expect(expectedError).toEqual(deleteError);
      expect(expectedError.message).toContain("Failed to download dmsObjectFile");
    });
  });
});
