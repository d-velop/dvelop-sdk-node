import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { SearchTasksParams, SearchTasksPage, buildRangeParameter, onResponseFactory, searchTasks } from "./search-tasks";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("build range parameters", () => {

  it("should create a valid range string", () => {
    const result = buildRangeParameter({ from: 10, to: 20, beginInclusive: true, endInclusive: false });
    expect(result).toBe("[10..20)");
  });

  it("should use inclusive search as default", () => {
    const result = buildRangeParameter({ from: 10, to: 20 });
    expect(result).toBe("[10..20]");
  });

  it("should throw when no values are present", () => {
    expect(() => buildRangeParameter({})).toThrow();
  });

  it("should work with an open range", () => {
    const result = buildRangeParameter({ to: 20 });
    expect(result).toBe("[..20]");
  });

  it("should work with Date", () => {
    const result = buildRangeParameter({
      from: new Date("2024-01-01T00:00:00.000Z"),
      to: new Date("2025-01-01T00:00:00.000Z")
    });
    expect(result).toBe("[2024-01-01T00:00:00.000Z..2025-01-01T00:00:00.000Z]");
  });
});

describe("searchTasks", () => {

  let context: DvelopContext;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "someBaseUri" };
  });

  function jsonResponse(data: any): Response {
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  it("should call dvelopFetch with method POST to the search endpoint", async () => {
    const params: SearchTasksParams = {};
    await searchTasks(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe("/task/api/tasks/search");
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({});
    expect(calledOptions).toMatchObject({ onResponse: expect.any(Function) });
  });

  it("should pass parameters as body", async () => {
    const params: SearchTasksParams = {
      pageSize: 5,
      orderBy: "subject",
      orderDir: "DESC",
      filter: { subject: ["test"] }
    };

    await searchTasks(context, params);

    expect(JSON.parse(mockDvelopFetch.mock.calls[0][2]!.body as string)).toEqual(params);
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await searchTasks(context, {}, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponseFactory", () => {

    it("should transform date values", async () => {
      const transform = onResponseFactory(context, {});
      const page = await transform(jsonResponse({
        tasks: [{
          id: "test1",
          receiveDate: "2024-01-01T12:00:00.000Z",
          dueDate: "2025-01-01T12:00:00.000Z",
          reminderDate: "2026-01-01T12:00:00.000Z",
          completionDate: "2027-01-01T12:00:00.000Z",
          state: "COMPLETED"
        }]
      }));

      expect(page.tasks[0].receiveDate).toStrictEqual(new Date("2024-01-01T12:00:00.000Z"));
      expect(page.tasks[0].dueDate).toStrictEqual(new Date("2025-01-01T12:00:00.000Z"));
      expect(page.tasks[0].reminderDate).toStrictEqual(new Date("2026-01-01T12:00:00.000Z"));
      expect(page.tasks[0].completionDate).toStrictEqual(new Date("2027-01-01T12:00:00.000Z"));
    });

    it("should not set getNextPage when no next link present", async () => {
      const transform = onResponseFactory(context, {});
      const page = await transform(jsonResponse({ tasks: [] }));
      expect(page.getNextPage).toBeUndefined();
    });

    it("should set getNextPage and follow the next link on invocation", async () => {
      const params: SearchTasksParams = { pageSize: 1 };
      const transform = onResponseFactory(context, params);
      const page = await transform(jsonResponse({ tasks: [], _links: { next: { href: "/test/next" } } }));

      expect(page.getNextPage).toEqual(expect.any(Function));

      const nextPage = { tasks: [] };
      mockDvelopFetch.mockResolvedValueOnce(nextPage as unknown as SearchTasksPage);
      await page.getNextPage!();

      expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
      const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
      expect(calledContext).toBe(context);
      expect(calledUrl).toBe("/test/next");
      expect(calledInit).toMatchObject({ method: "POST" });
      expect(JSON.parse(calledInit!.body as string)).toEqual(params);
      expect(calledOptions).toMatchObject({ onResponse: expect.any(Function) });
    });
  });
});
