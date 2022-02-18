import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { GetBoEntitiesParams, _getBoEntitiesDefaultTransformFunction, _getBoEntitiesFactory } from "./get-entities";

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

    it("should transform correctly", async () => {

      const response: any = { value: [
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
      ]};

      mockHttpRequestFunction.mockResolvedValue({ data: response } as HttpResponse);

      const getBoEntities = _getBoEntitiesFactory(mockHttpRequestFunction, _getBoEntitiesDefaultTransformFunction);
      const result:any[] = await getBoEntities(context, params);

      response.value.forEach((entity: any, i: number) => {
        expect(result[i]).toHaveProperty("employeeid", entity.employeeid);
      });
    });
  });
});
