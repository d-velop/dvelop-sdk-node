import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { GetBoEntitiesParams, _getBoEntitiesDefaultTransformFunctionFactory, _getBoEntitiesFactory, GetBoEntitiesResultPage } from "./get-entities";

describe("getBoEntitiesFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetBoEntitiesParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees"
    };
  });

  it("should make correct request", async () => {

    const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, mockTransformFunction);
    await getBoEntities(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`,
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, mockTransformFunction);
    const result = await getBoEntities(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
    expect(result).toEqual(transformResult);
  });

  describe("getBoEntitiesDefaultTransformFunction", () => {

    it("should set entities", async () => {

      const response: any = {
        value: [
          {
            "employeeid": "1",
            "firstName": "John",
            "lastName": "Dorian",
            "jobTitel": "senior physician"
          },
          {
            "employeeid": "2",
            "firstName": "Christopher",
            "lastName": "Turk",
            "jobTitel": "chief surgeon"
          }
        ]
      };

      mockHttpRequestFunction.mockResolvedValue({ data: response } as HttpResponse);

      const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, _getBoEntitiesDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: GetBoEntitiesResultPage = await getBoEntities(context, params);

      response.value.forEach((entity: any, i: number) => {
        expect(result.value[i]).toHaveProperty("employeeid", entity.employeeid);
      });
      expect(result).not.toHaveProperty("getNextPage");
    });

    it("should set getNextPage function on @odata.nextLink-property", async () => {

      const response: any = {
        value: [
          {
            "employeeid": "1",
            "firstName": "John",
            "lastName": "Dorian",
            "jobTitel": "senior physician"
          }
        ],
        "@odata.nextLink": "HiItsMeNextLink"
      };

      mockHttpRequestFunction.mockResolvedValue({ data: response } as HttpResponse);

      const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, _getBoEntitiesDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: GetBoEntitiesResultPage = await getBoEntities(context, params);

      expect(result).toHaveProperty("getNextPage");

      const response2: any = {
        value: [
          {
            "employeeid": "2",
            "firstName": "Christopher",
            "lastName": "Turk",
            "jobTitel": "chief surgeon"
          }
        ]
      };
      mockHttpRequestFunction.mockResolvedValue({ data: response2 } as HttpResponse);

      let page2 = await result.getNextPage();

      expect(page2.value).toContain(response2.value[0]);
      expect(mockHttpRequestFunction).toBeCalledTimes(2);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: "HiItsMeNextLink"
      });
    });

    it("should return empty array on no value", async () => {

      const response: any = {
        value: []
      };

      mockHttpRequestFunction.mockResolvedValue({ data: response } as HttpResponse);

      const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, _getBoEntitiesDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: GetBoEntitiesResultPage = await getBoEntities(context, params);

      expect(result).toHaveProperty("value");
      expect(result.value).toHaveLength(0);
    });
  });
});
