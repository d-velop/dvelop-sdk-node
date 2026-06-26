import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { GetBoEntityParams, getBoEntity, onResponse } from "./get-entity";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getBoEntity", () => {

  let context: DvelopContext;
  let params: GetBoEntityParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "someBaseUri" };
    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees",
      keyPropertyType: "string",
      keyPropertyValue: "1"
    };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getBoEntity(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/businessobjects/custom/HOSPITALBASEDATA/employees('1')",
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  [
    { keyPropertyValue: "1", keyPropertyType: "string", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees('1')" },
    { keyPropertyValue: 2, keyPropertyType: "number", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(2)" },
    { keyPropertyValue: "HiItsMeGuid", keyPropertyType: "guid", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(HiItsMeGuid)" }
  ].forEach(testCase => {
    it(`should build url for keyPropertyType ${testCase.keyPropertyType}`, async () => {
      await getBoEntity(context, {
        ...params,
        keyPropertyType: testCase.keyPropertyType as "string" | "number" | "guid",
        keyPropertyValue: testCase.keyPropertyValue
      });
      expect(mockDvelopFetch.mock.calls[0][1]).toEqual(testCase.expectedUrl);
    });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getBoEntity(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should return the entity", async () => {
      const entity = { employeeId: "1", firstName: "John Micheal", lastName: "Dorian" };
      const result = await onResponse(jsonResponse(entity));
      expect(result).toEqual(entity);
    });

    it("should strip @odata.context", async () => {
      const result = await onResponse(jsonResponse({ "@odata.context": "someContext", employeeId: "1" }));
      expect(result["@odata.context"]).toBeUndefined();
      expect(result.employeeId).toEqual("1");
    });
  });
});
