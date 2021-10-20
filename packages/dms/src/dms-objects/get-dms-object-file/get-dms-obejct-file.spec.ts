import { DvelopContext, NotFoundError } from "../../index";
import { HttpResponse } from "../../internals";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { getDmsObjectFileDefaultTransformFunction, getDmsObjectMainFileFactory, getDmsObjectPdfFileFactory } from "./get-dms-object-file";

[
  {
    name: "getDmsObjectMainFile", factory: getDmsObjectMainFileFactory, follow: "mainblobcontent"
  },
  {
    name: "getDmsObjectPdfFile", factory: getDmsObjectPdfFileFactory, follow: "pdfblobcontent"
  }
].forEach(testCase => {
  describe(`${testCase.name}`, () => {

    let mockHttpRequestFunction = jest.fn();
    let mockTransformFunction = jest.fn();

    let context: DvelopContext;
    let params: GetDmsObjectParams;

    beforeEach(() => {

      jest.resetAllMocks();

      context = {
        systemBaseUri: "HiItsMeSystemBaseUri"
      };

      params = {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        dmsObjectId: "HiItsMeDmsObjectId"
      };
    });

    it("should make correct request", async () => {

      const functionImplementation = testCase.factory(mockHttpRequestFunction, mockTransformFunction);
      await functionImplementation(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: "/dms",
        headers: {
          "Accept": "application/octet-stream"
        },
        responseType: "arraybuffer",
        follows: ["repo", "dmsobjectwithmapping", testCase.follow],
        templates: {
          "repositoryid": params.repositoryId,
          "sourceid": params.sourceId,
          "dmsobjectid": params.dmsObjectId
        }
      });
    });

    it("should map NoHalJsonLinksError to NotFoundError", async () => {

      const noLinksError: NotFoundError = new NotFoundError("HiItsMeFollow", {} as any);
      mockHttpRequestFunction.mockRejectedValue(noLinksError);

      const functionImplementation = testCase.factory(mockHttpRequestFunction, mockTransformFunction);

      let expectedError: Error;
      try {
        await functionImplementation(context, params);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof NotFoundError).toBeTruthy();
    });

    it("should rethrow unknown errors", async () => {
      const error: Error = new Error("HiItsMeError");
      mockHttpRequestFunction.mockRejectedValue(error);

      const functionImplementation = testCase.factory(mockHttpRequestFunction, mockTransformFunction);

      let expectedError: Error;
      try {
        await functionImplementation(context, params);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError).toBe(error);
    });

    it("should pass response to transform and return transform-result", async () => {

      const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
      const transformResult: any = { result: "HiItsMeResult" };
      mockHttpRequestFunction.mockResolvedValue(response);
      mockTransformFunction.mockReturnValue(transformResult);

      const functionImplementation = testCase.factory(mockHttpRequestFunction, mockTransformFunction);
      await functionImplementation(context, params);

      expect(mockTransformFunction).toHaveBeenCalledTimes(1);
      expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
    });

    describe("getDmsObjectFileDefaultTransformFunction", () => {

      it("should return response ArrayBuffer", async () => {
        const file: ArrayBuffer = new ArrayBuffer(42);
        const response: HttpResponse = { data: file } as HttpResponse;
        mockHttpRequestFunction.mockResolvedValue(response);

        const functionImplementation = testCase.factory(mockHttpRequestFunction, getDmsObjectFileDefaultTransformFunction);
        const result = await functionImplementation(context, params);

        expect(result).toEqual(file);
      });
    });
  });
});
