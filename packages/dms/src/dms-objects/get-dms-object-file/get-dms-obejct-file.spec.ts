import { NotFoundError } from "../../utils/errors";
import { Context } from "../../utils/context";
import { GetDmsObjectParams, getDmsObject } from "../get-dms-object/get-dms-object";
import { GetDmsObjectFileTransformer, getDmsObjectFile, getDmsObjectPdf } from "./get-dms-object-file";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";

jest.mock("../get-dms-object/get-dms-object");
const mockGetDmsObject = getDmsObject as jest.MockedFunction<typeof getDmsObject>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockGET = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;
let mockTransform: any;

let context: Context;
let params: GetDmsObjectParams;

[
  {
    testContext: "getDmsObjectFile",
    call: async (context: Context, params: GetDmsObjectParams, transform?: GetDmsObjectFileTransformer<any>) => getDmsObjectFile(context, params, transform),
    dmsObejectResponse: { _links: { mainblobcontent: { href: "HiItsMeHref" } } },
    notFoundErrorMessage: "Failed to get dmsObjectFile: No href for mainblobcontent indicating there is no file for this dmsObject."
  }, {
    testContext: "getDmsObjectPdf",
    call: async (context: Context, params: GetDmsObjectParams, transform?: GetDmsObjectFileTransformer<any>) => getDmsObjectPdf(context, params, transform),
    dmsObejectResponse: { _links: { pdfblobcontent: { href: "HiItsMeHref" } } },
    notFoundErrorMessage: "Failed to get dmsObjectPdf: No href for pdfblobcontent indicating there is no pdf for this dmsObject."
  }
].forEach(testCase => {
  describe(`${testCase.testContext}`, () => {

    beforeEach(() => {

      jest.resetAllMocks();

      mockGetDmsObject.mockResolvedValue({ data: testCase.dmsObejectResponse });
      mockGetAxiosInstace.mockReturnValueOnce({
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

    it("should call getDmsObject correctly", async () => {
      await testCase.call(context, params, mockTransform);
      expect(mockGetDmsObject).toHaveBeenCalledTimes(1);
      expect(mockGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
    });

    it("should not catch errors from getDmsObject", async () => {
      const error: Error = new Error("HiItsMeError");
      mockGetDmsObject.mockImplementation(() => { throw error; });

      let expectedError: Error;
      try {
        await testCase.call(context, params, mockTransform);
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
          await testCase.call(context, params, mockTransform);
        } catch (e) {
          expectedError = e;
        }

        expect(expectedError instanceof NotFoundError).toBeTruthy();
        expect(expectedError.message).toContain(testCase.notFoundErrorMessage);
      });
    });

    it("should do GET correctly", async () => {

      await testCase.call(context, params, mockTransform);

      expect(mockGET).toHaveBeenCalledTimes(1);
      expect(mockGET).toHaveBeenCalledWith("HiItsMeHref", {

        baseURL: context.systemBaseUri,
        headers: {
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/octet-stream"
        },
        responseType: "arraybuffer"
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
        await testCase.call(context, params, mockTransform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockMapRequestError).toHaveBeenCalledTimes(1);
      expect(mockMapRequestError).toHaveBeenCalledWith([400, 404], "Failed to download dmsObjectFile", getError);
      expect(expectedError).toEqual(mappedError);
    });

    it("should return custom transform", async () => {

      const response: AxiosResponse = {
        statusText: "sucess"
      } as AxiosResponse;

      mockGET.mockResolvedValue(response);

      await testCase.call(context, params, mockTransform);

      expect(mockTransform).toHaveBeenCalledTimes(1);
      expect(mockTransform).toHaveBeenLastCalledWith(response, context, params);
    });

    describe("default transform", () => {

      it("should not transform", async () => {
        const file = new ArrayBuffer(42);

        mockGET.mockResolvedValue({
          data: new ArrayBuffer(42)
        } as AxiosResponse);

        const result: ArrayBuffer = await testCase.call(context, params);

        expect(result).toEqual(file);
      });
    });
  });
});
