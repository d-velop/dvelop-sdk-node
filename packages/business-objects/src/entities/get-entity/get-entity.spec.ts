import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { GetBoEntityParams, _getBoEntityDefaultTransformFunction, _getBoEntityFactory } from "./get-entity";

describe("getBoEntityFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetBoEntityParams;

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

      const getBoEntity = _getBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
      await getBoEntity(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: testCase.expectedUrl
      });
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getBoEntities = _getBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
    const result = await getBoEntities(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
    expect(result).toEqual(transformResult);
  });

  describe("getBoEntityDefaultTransformFunction", () => {

    it("should transform correctly", async () => {

      const data: any = {
        "employeeid": "1",
        "firstName": "John",
        "lastName": "Dorian",
        "jobTitel": "senior physician"
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getBoEntity = _getBoEntityFactory(mockHttpRequestFunction, _getBoEntityDefaultTransformFunction);
      const result = await getBoEntity(context, params);

      expect(result).toHaveProperty("employeeid", data.employeeid);
    });
  });
});
