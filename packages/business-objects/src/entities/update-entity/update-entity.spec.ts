import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { UpdateBoEntityParams, updateBoEntity, onResponse } from "./update-entity";
import { BusinessObjectsError } from "../../utils/business-objects-error";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("updateBoEntity", () => {

  let context: DvelopContext;
  let params: UpdateBoEntityParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "someBaseUri" };
    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees",
      keyPropertyType: "string",
      keyPropertyValue: "1",
      entityChange: { firstName: "J.D." }
    };
  });

  it("should call dvelopFetch with method PATCH and serialized entityChange", async () => {
    await updateBoEntity(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toEqual("/businessobjects/custom/HOSPITALBASEDATA/employees('1')");
    expect(calledInit).toMatchObject({ method: "PATCH" });
    expect(JSON.parse(calledInit!.body as string)).toEqual(params.entityChange);
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  [
    { keyPropertyValue: "1", keyPropertyType: "string", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees('1')" },
    { keyPropertyValue: 2, keyPropertyType: "number", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(2)" },
    { keyPropertyValue: "HiItsMeGuid", keyPropertyType: "guid", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(HiItsMeGuid)" }
  ].forEach(testCase => {
    it(`should build url for keyPropertyType ${testCase.keyPropertyType}`, async () => {
      await updateBoEntity(context, {
        ...params,
        keyPropertyType: testCase.keyPropertyType as "string" | "number" | "guid",
        keyPropertyValue: testCase.keyPropertyValue
      });
      expect(mockDvelopFetch.mock.calls[0][1]).toEqual(testCase.expectedUrl);
    });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await updateBoEntity(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve on a successful response", async () => {
      await expect(onResponse(new Response(null, { status: 204 }))).resolves.toBeUndefined();
    });

    it("should throw on a failed response", async () => {
      await expect(onResponse(new Response(null, { status: 500 }))).rejects.toBeInstanceOf(BusinessObjectsError);
    });
  });
});
