import { DvelopContext, dvelopFetch, generateRequestId } from "@dvelop-sdk/core";
import { CreateTaskParams, onResponse, createTask } from "./create-task";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn(), generateRequestId: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;
const mockGenerateRequestId = generateRequestId as jest.MockedFunction<typeof generateRequestId>;

describe("createTask", () => {

  let context: DvelopContext;
  let params: CreateTaskParams;

  beforeEach(() => {
    jest.resetAllMocks();
    mockGenerateRequestId.mockReturnValue("HiItsMeGeneratedCorrelationKey");
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = {
      subject: "HiItsMeSubject",
      assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"]
    };
  });

  function calledBody(): any {
    return JSON.parse(mockDvelopFetch.mock.calls[0][2]!.body as string);
  }

  it("should call dvelopFetch with method POST to /task/tasks", async () => {
    await createTask(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe("/task/tasks");
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should generate a correlationKey when none is given", async () => {
    await createTask(context, params);
    expect(calledBody().correlationKey).toEqual("HiItsMeGeneratedCorrelationKey");
  });

  it("should keep a caller-supplied correlationKey", async () => {
    await createTask(context, { ...params, correlationKey: "HiItsMeCorrelationKey" });
    expect(mockGenerateRequestId).not.toHaveBeenCalled();
    expect(calledBody().correlationKey).toEqual("HiItsMeCorrelationKey");
  });

  it("should send subject and assignees", async () => {
    await createTask(context, params);
    const body = calledBody();
    expect(body.subject).toEqual("HiItsMeSubject");
    expect(body.assignees).toEqual(["HiItsMeAssignee1", "HiItsMeAssignee2"]);
  });

  it("should send actionScopes", async () => {
    const actionScopes: CreateTaskParams["actionScopes"] = { complete: ["details"], claim: ["list"], forward: ["details", "list"] };
    await createTask(context, { ...params, actionScopes });
    expect(calledBody().actionScopes).toEqual(actionScopes);
  });

  it("should parse dueDate", async () => {
    const date: Date = new Date();
    await createTask(context, { ...params, dueDate: date });
    expect(calledBody().dueDate).toEqual(date.toISOString());
  });

  it("should parse reminderDate", async () => {
    const date: Date = new Date();
    await createTask(context, { ...params, reminderDate: date });
    expect(calledBody().reminderDate).toEqual(date.toISOString());
  });

  it("should parse dmsObject", async () => {
    const dmsObject = { repositoryId: "HiItsMeRepoId", dmsObjectId: "HiItsMeDmsObjectId" };
    await createTask(context, { ...params, dmsObject });
    expect(calledBody().dmsReferences).toEqual([{
      repoId: dmsObject.repositoryId,
      objectId: dmsObject.dmsObjectId
    }]);
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await createTask(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should return the location header", async () => {
      const response = new Response(null, { status: 201, headers: { location: "HiItsMeLocation" } });
      const result: string = await onResponse(response);
      expect(result).toEqual("HiItsMeLocation");
    });

    it("should return an empty string when no location header is present", async () => {
      const response = new Response(null, { status: 201 });
      const result: string = await onResponse(response);
      expect(result).toEqual("");
    });
  });
});
