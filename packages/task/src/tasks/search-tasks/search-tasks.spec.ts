import {_searchTasksDefaultTransformFunctionFactory, _searchTasksFactory, buildRangeParameter, SearchTasksParams} from "./search-tasks";
import {DvelopContext} from "@dvelop-sdk/core";
import {HttpResponse} from "../../utils/http";

describe("build range parameters", () => {

  it("should create a valid range string", () => {
    const result = buildRangeParameter({
      from: 10,
      to: 20,
      beginInclusive: true,
      endInclusive: false
    });

    expect(result).toBe("[10..20)");
  });

  it("should use inclusive search as default", () => {
    const result = buildRangeParameter({
      from: 10,
      to: 20
    });

    expect(result).toBe("[10..20]");
  });

  it("should throw when no values are present", () => {
    expect(() => buildRangeParameter({})).toThrow();
  });

  it("should work with an open range", () => {
    const result = buildRangeParameter({
      to: 20
    });

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

describe("search tasks", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext = {
    systemBaseUri: "someBaseUri"
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should call the correct endpoint", async () => {
    const searchTasks = _searchTasksFactory(mockHttpRequestFunction, mockTransformFunction);

    let params : SearchTasksParams = {};

    await searchTasks(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/task/api/tasks/search",
      data: {}
    });
  });

  it("should pass parameters", async () => {
    const searchTasks = _searchTasksFactory(mockHttpRequestFunction, mockTransformFunction);

    let params : SearchTasksParams = {
      pageSize: 5,
      orderBy: "subject",
      orderDir: "DESC",
      filter: {
        subject: ["test"]
      }
    };

    await searchTasks(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/task/api/tasks/search",
      data: {
        pageSize: 5,
        orderBy: "subject",
        orderDir: "DESC",
        filter: {
          subject: ["test"]
        }
      }
    });
  });

  it("should support paging", async () => {
    mockHttpRequestFunction.mockResolvedValue({ data: {
      tasks: [],
      _links: {
        next: {href: "/test/next"}
      }
    }} as unknown as HttpResponse);

    const transformFunction = _searchTasksDefaultTransformFunctionFactory(mockHttpRequestFunction);
    const searchTasks = _searchTasksFactory(mockHttpRequestFunction, transformFunction);

    const params : SearchTasksParams = {
      pageSize: 1
    };
    let searchTasksPage = await searchTasks(context, params);

    await searchTasksPage.getNextPage();

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(2);

    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/test/next",
      data: {
        pageSize: 1
      }
    });

  });
});