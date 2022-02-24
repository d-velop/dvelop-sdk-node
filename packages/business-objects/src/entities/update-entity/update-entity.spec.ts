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
      entityKeyValue: "1",
      entityChange: {
        "firstName": "J.D."
      }
    };
  });

  [
    { entityKeyValue: "1", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees('1')" },
    { entityKeyValue: 2, expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(2)" }
  ].forEach(testCase => {
    it("should make correct request", async () => {

      params.entityKeyValue = testCase.entityKeyValue;

      const deleteBoEntity = _updateBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
      await deleteBoEntity(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "PUT",
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
