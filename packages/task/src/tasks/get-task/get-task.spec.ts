import {_getTaskDefaultTransformFunction, _getTaskFactory, GetTaskParams} from "./get-task";
import {DvelopContext} from "@dvelop-sdk/core";
import {HttpResponse} from "../../utils/http";

describe("getTaskFactory", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();
   
  let params : GetTaskParams = {
    taskId: "SomeTestId"
  };
  let context: DvelopContext = {
    systemBaseUri: "someBaseUri"
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });
    
  it("should map params correctly", async () => {
    const getTask = _getTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    
    await getTask(context, params);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/task/tasks/SomeTestId"
    });
  });

  it("should transform response", async () => {
    mockHttpRequestFunction.mockResolvedValue({ data: { 
      "id" : "SomeTestId",
      "subject" : "My subject",
      "assignees" : ["bob"],
      "sender" : "alice",
      "receiveDate" : "2024-07-28T12:12:12.000Z"
    }} as unknown as HttpResponse);
    const getTask = _getTaskFactory(mockHttpRequestFunction, _getTaskDefaultTransformFunction);

    const task = await getTask(context, params);

    expect(task.id).toBe("SomeTestId");
    expect(task.subject).toBe("My subject");
    expect(task.assignees).toEqual(["bob"]);
    expect(task.sender).toBe("alice");
    expect(task.receiveDate).toEqual(new Date("2024-07-28T12:12:12.000Z"));
  });

});