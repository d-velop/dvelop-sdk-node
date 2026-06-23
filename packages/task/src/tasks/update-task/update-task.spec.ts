import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { UpdateTaskParams, onResponse, updateTask } from "./update-task";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

interface TestCase {
  params: UpdateTaskParams;
  expectedData: any;
}

describe("updateTask", () => {

  let context: DvelopContext;
  let params: UpdateTaskParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      location: "HiItsMeLocation",
      subject: "HiItsMeSubject",
      assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"]
    };
  });

  const testCases: TestCase[] = [
    {
      params: {
        location: "HiItsMeLocation",
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
        location: "HiItsMeLocation",
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeGeneratedCorrelationKey",
      },
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        correlationKey: "HiItsMeGeneratedCorrelationKey",
      }
    },
    {
      params: {
        location: "HiItsMeLocation",
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        actionScopes: {
          complete: ["details"],
          claim: ["list"],
          forward: ["details", "list"]
        }
      },
      expectedData: {
        subject: "HiItsMeSubject",
        assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"],
        actionScopes: {
          complete: ["details"],
          claim: ["list"],
          forward: ["details", "list"]
        }
      }
    },
  ];

  testCases.forEach(testCase => {
    it("should call dvelopFetch with method PATCH and correct body", async () => {
      await updateTask(context, testCase.params);

      expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
      const [calledContext, calledUrl, calledInit] = mockDvelopFetch.mock.calls[0];
      expect(calledContext).toBe(context);
      expect(calledUrl).toBe(params.location);
      expect(calledInit).toMatchObject({ method: "PATCH" });
      expect(JSON.parse(calledInit!.body as string)).toEqual(testCase.expectedData);
    });
  });

  it("should parse dueDate", async () => {
    const date: Date = new Date();
    await updateTask(context, { ...params, dueDate: date });

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).dueDate).toEqual(date.toISOString());
  });

  it("should parse reminderDate", async () => {
    const date: Date = new Date();
    await updateTask(context, { ...params, reminderDate: date });

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).reminderDate).toEqual(date.toISOString());
  });

  it("should parse dmsObject", async () => {
    const dmsObject = { repositoryId: "HiItsMeRepoId", dmsObjectId: "HiItsMeDmsObjectId" };
    await updateTask(context, { ...params, dmsObject });

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).dmsReferences).toEqual([{
      repoId: dmsObject.repositoryId,
      objectId: dmsObject.dmsObjectId
    }]);
  });

  it("should not include location in the body", async () => {
    await updateTask(context, params);

    const calledInit = mockDvelopFetch.mock.calls[0][2];
    expect(JSON.parse(calledInit!.body as string).location).toBeUndefined();
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await updateTask(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve on success", async () => {
      const response = new Response(null, { status: 200 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
