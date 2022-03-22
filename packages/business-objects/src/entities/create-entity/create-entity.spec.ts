import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { CreateBoEntityParams, _createBoEntityFactory } from "./create-entity";

describe("createBoEntityFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: CreateBoEntityParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = { 
      modelName: "HOSPITALBASEDATA", 
      pluralEntityName: "employees", 
      entity: {
        "employeeid": "1",
        "firstName": "John",
        "lastName": "Dorian",
        "jobTitel": "senior physician"
      }
    };
  });

  it("should make correct request", async () => {

    const createBoEntity = _createBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
    await createBoEntity(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`,
      data: params.entity
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const createBoEntity = _createBoEntityFactory(mockHttpRequestFunction, mockTransformFunction);
    await createBoEntity(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});
