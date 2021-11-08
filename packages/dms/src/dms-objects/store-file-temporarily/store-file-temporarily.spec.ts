import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { _storeFileTemporarilyDefaultTransformFunction, _storeFileTemporarilyFactory, StoreFileTemporarilyParams } from "./store-file-temporarily";

describe("storeFileTemporarilyFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: StoreFileTemporarilyParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      content: new ArrayBuffer(42)
    };
  });

  it("should make correct request", async () => {

    const storeFileTemporarily = _storeFileTemporarilyFactory(mockHttpRequestFunction, mockTransformFunction);
    await storeFileTemporarily(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "chunkedupload"],
      templates: { "repositoryid": params.repositoryId },
      headers: { "Content-Type": "application/octet-stream" },
      data: params.content
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const storeFileTemporarily = _storeFileTemporarilyFactory(mockHttpRequestFunction, mockTransformFunction);
    await storeFileTemporarily(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("storeFileTemporarilyDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const headers: any = {
        "location": "HiItsmeLocation",
        "some-header": "HiItsMeSomeHeader"
      };

      mockHttpRequestFunction.mockResolvedValue({ headers: headers } as HttpResponse);

      const storeFileTemporarily = _storeFileTemporarilyFactory(mockHttpRequestFunction, _storeFileTemporarilyDefaultTransformFunction);
      const result: string = await storeFileTemporarily(context, params);

      expect(result).toEqual(headers["location"]);
    });
  });
});
