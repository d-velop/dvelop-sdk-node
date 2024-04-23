import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { CreateTaskParams, _createTaskDefaultTransformFunction, _createTaskFactory } from "./create-task";

interface TestCase {
  params: CreateTaskParams;
  mockedUuidGenerator?: () => string;
  expectedData: any;
}

describe("createTaskFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: CreateTaskParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      subject: "HiItsMeSubject",
      assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"]
    };
  });

  const testCases: TestCase[] = [
    {
      params: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"]
      },
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
      }
    },
    {
      params: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeCorrelationKey"
      },
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeCorrelationKey"
      }
    },
    {
      params: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeCorrelationKey"
      },
      mockedUuidGenerator: () => "HiItsMeGeneratedCorrelationKey",
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeCorrelationKey"
      }
    },
    {
      params: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
      },
      mockedUuidGenerator: () => "HiItsMeGeneratedCorrelationKey",
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeGeneratedCorrelationKey"
      }
    },
    {
      params: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        actionScopes: {
          complete: ["details"],
          claim: ["list"],
          forward: ["details", "list"]
        }
      },
      mockedUuidGenerator: () => "HiItsMeGeneratedCorrelationKey",
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeGeneratedCorrelationKey",
        actionScopes: {
          complete: ["details"],
          claim: ["list"],
          forward: ["details", "list"]
        }
      }
    },
  ]

  testCases.forEach(testCase => {
    it("should make correct request", async () => {

      const createTask = _createTaskFactory(mockHttpRequestFunction, mockTransformFunction, testCase.mockedUuidGenerator);
      await createTask(context, testCase.params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "POST",
        url: "/task/tasks",
        data: testCase.expectedData
      });
    });
  });

  it("should parse dueDate", async () => {

    const date: Date = new Date();

    const updateTask = _createTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, { ...params, ...{ dueDate: date } });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        dueDate: date.toISOString()
      })
    }));
  });

  it("should parse reminderDate", async () => {

    const date: Date = new Date();

    const updateTask = _createTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, { ...params, ...{ reminderDate: date } });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        reminderDate: date.toISOString()
      })
    }));
  });

  it("should parse dmsObject", async () => {

    const dmsObject: any = {
      repositoryId: "HiItsMeRepoId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };

    const createTask = _createTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await createTask(context, { ...params, ...{ dmsObject: dmsObject } });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        dmsReferences: [{
          repoId: dmsObject.repositoryId,
          objectId: dmsObject.dmsObjectId
        }]
      })
    }));
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const createTask = _createTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await createTask(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("createTaskDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const location: string = "HiItsMeLocation";
      mockHttpRequestFunction.mockResolvedValue({ headers: { "location": location } } as unknown as HttpResponse);

      const createTask = _createTaskFactory(mockHttpRequestFunction, _createTaskDefaultTransformFunction);
      const result: string = await createTask(context, params);

      expect(result).toEqual(location);
    });
  });
});