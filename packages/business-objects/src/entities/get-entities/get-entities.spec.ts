import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { GetBoEntitiesParams, GetBoEntitiesResultPage, buildResultPage, defaultOnResponseFactory, getBoEntities } from "./get-entities";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getBoEntities", () => {

  let context: DvelopContext;
  let params: GetBoEntitiesParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "https://someBaseUri" };
    params = {
      modelName: "HOSPITALBASEDATA",
      pluralEntityName: "employees"
    };
  });

  function jsonResponse(data: any): Response {
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  it("should call dvelopFetch with method GET", async () => {
    await getBoEntities(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/businessobjects/custom/HOSPITALBASEDATA/employees",
      { method: "GET" },
      expect.objectContaining({ onResponse: expect.any(Function) })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getBoEntities(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse / buildResultPage", () => {

    it("should set value and no getNextPage when there is no nextLink", async () => {
      const data = { value: [{ employeeId: "1" }, { employeeId: "2" }] };
      const result: GetBoEntitiesResultPage = await defaultOnResponseFactory(context)(jsonResponse(data));

      expect(result.value).toEqual(data.value);
      expect(result.getNextPage).toBeUndefined();
    });

    it("should return an empty value array", async () => {
      const result = await buildResultPage(jsonResponse({ value: [] }), context);
      expect(result.value).toHaveLength(0);
    });

    it("should set getNextPage when a nextLink is present and follow it", async () => {
      const page1 = { value: [{ employeeId: "1" }], "@odata.nextLink": "/businessobjects/custom/HOSPITALBASEDATA/employees?skip=1" };
      const result = await buildResultPage(jsonResponse(page1), context);

      expect(result.getNextPage).toBeDefined();

      const page2 = { value: [{ employeeId: "2" }] };
      mockDvelopFetch.mockResolvedValue({ value: page2.value } as any);

      const next = await result.getNextPage!();

      expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
      expect(mockDvelopFetch).toHaveBeenCalledWith(
        context,
        "/businessobjects/custom/HOSPITALBASEDATA/employees?skip=1",
        { method: "GET" },
        expect.objectContaining({ onResponse: expect.any(Function) })
      );
      expect(next.value).toEqual(page2.value);
    });

    it("should strip the systemBaseUri from an absolute nextLink", async () => {
      const page1 = { value: [{ employeeId: "1" }], "@odata.nextLink": `${context.systemBaseUri}/businessobjects/custom/HOSPITALBASEDATA/employees?skip=1` };
      const result = await buildResultPage(jsonResponse(page1), context);

      mockDvelopFetch.mockResolvedValue({ value: [] } as any);
      await result.getNextPage!();

      expect(mockDvelopFetch.mock.calls[0][1]).toEqual("/businessobjects/custom/HOSPITALBASEDATA/employees?skip=1");
    });
  });
});
