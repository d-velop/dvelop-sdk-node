import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { UpdateBoEntityParams, _updateBoEntityFactory } from "./update-entity";

describe("updateBoEntityFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: UpdateBoEntityParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees",
      keyPropertyType: "string",
      keyPropertyValue: "1",
      entityChange: {
        "firstName": "J.D."
      }
    };
  });

  [
    { keyPropertyValue: "1", keyPropertyType: "string", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees('1')" },
    { keyPropertyValue: 2, keyPropertyType: "number", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(2)" },
    { keyPropertyValue: "HiItsMeGuid", keyPropertyType: "guid", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(HiItsMeGuid)" }
  ].forEach(testCase => {
    it("should make correct request", async () => {

      params.keyPropertyValue = testCase.keyPropertyValue;
      params.keyPropertyType = testCase.keyPropertyType as "string" | "number" | "guid";

      const deleteBoEntity = _updateBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
      await deleteBoEntity(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "PATCH",
        url: testCase.expectedUrl,
        data: params.entityChange
      });
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const updateBoEntity = _updateBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateBoEntity(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});
