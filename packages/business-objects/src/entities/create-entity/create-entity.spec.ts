import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { CreateBoEntityParams, createBoEntity, onResponse } from "./create-entity";
import { BusinessObjectsError } from "../../utils/business-objects-error";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("createBoEntity", () => {

  let context: DvelopContext;
  let params: CreateBoEntityParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "someBaseUri" };
    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees",
      entity: {
        employeeId: "1",
        firstName: "John Micheal",
        lastName: "Dorian"
      }
    };
  });

  it("should call dvelopFetch with method POST and serialized entity", async () => {
    await createBoEntity(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toEqual("/businessobjects/custom/HOSPITALBASEDATA/employees");
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual(params.entity);
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await createBoEntity(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve on a successful response", async () => {
      await expect(onResponse(new Response(null, { status: 201 }))).resolves.toBeUndefined();
    });

    it("should throw on a failed response", async () => {
      await expect(onResponse(new Response(null, { status: 500 }))).rejects.toBeInstanceOf(BusinessObjectsError);
    });
  });
});
