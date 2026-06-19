import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { DeleteTaskParams, onResponse, deleteTask } from "./delete-task";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("deleteTask", () => {

  let context: DvelopContext;
  let params: DeleteTaskParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { location: "HiItsMeLocation" };
  });

  it("should call dvelopFetch with method DELETE", async () => {
    await deleteTask(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      params.location,
      { method: "DELETE" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await deleteTask(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve on success", async () => {
      const response = new Response(null, { status: 204 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
