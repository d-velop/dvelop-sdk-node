import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { DeleteBoEntityParams, deleteBoEntity, onResponse } from "./delete-entity";
import { BusinessObjectsError } from "../../utils/business-objects-error";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("deleteBoEntity", () => {

  let context: DvelopContext;
  let params: DeleteBoEntityParams;

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

  it("should call dvelopFetch with method DELETE", async () => {
    await deleteBoEntity(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/businessobjects/custom/HOSPITALBASEDATA/employees('1')",
      { method: "DELETE" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  [
    { keyPropertyValue: "1", keyPropertyType: "string", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees('1')" },
    { keyPropertyValue: 2, keyPropertyType: "number", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(2)" },
    { keyPropertyValue: "HiItsMeGuid", keyPropertyType: "guid", expectedUrl: "/businessobjects/custom/HOSPITALBASEDATA/employees(HiItsMeGuid)" }
  ].forEach(testCase => {
    it(`should build url for keyPropertyType ${testCase.keyPropertyType}`, async () => {
      await deleteBoEntity(context, {
        ...params,
        keyPropertyType: testCase.keyPropertyType as "string" | "number" | "guid",
        keyPropertyValue: testCase.keyPropertyValue
      });
      expect(mockDvelopFetch.mock.calls[0][1]).toEqual(testCase.expectedUrl);
    });
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await deleteBoEntity(context, params, options);
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
