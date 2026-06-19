import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { onResponse, getTaskCount } from "./get-task-count";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getTaskCount", () => {

  let context: DvelopContext;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getTaskCount(context);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/task/count/all",
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getTaskCount(context, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should map count correctly", async () => {
      const response = new Response(JSON.stringify({ count: 42 }), {
        status: 200, headers: { "Content-Type": "application/json" }
      });

      const result: number = await onResponse(response);

      expect(result).toEqual(42);
    });
  });
});
