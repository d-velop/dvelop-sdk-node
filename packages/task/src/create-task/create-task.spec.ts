import axios from "axios";
import { createTask } from "./create-task";
import { Task } from "../task";

jest.mock("axios");

describe("createTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
    mockedAxios.post.mockResolvedValue({
      headers: {
        location: "some/location/uri/4711"
      }
    });
  });

  it("should make POST with correct URI", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };

    await createTask(systemBaseUri, authessionId, task);

    expect(mockedAxios.post).toBeCalledWith(`${systemBaseUri}/task/tasks`, expect.any(Object), expect.any(Object));
  });

  it("should make POST with correct headers", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };

    await createTask(systemBaseUri, authessionId, task);

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}`, "Origin": systemBaseUri } });
  });

  it("should make POST with correct body", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };

    await createTask(systemBaseUri, authessionId, task);

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), task, expect.any(Object));
  });

  it("should generate a correlation key", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"]
    };

    const createdTask: Task = await createTask(systemBaseUri, authessionId, task);

    expect(createdTask.correlationKey).not.toBeUndefined();
    expect(createdTask.correlationKey).not.toBeNull();
    expect(createdTask.correlationKey).not.toEqual("");
  });

  it("should use the correlation key the user added to the task object", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };

    const createdTask: Task = await createTask(systemBaseUri, authessionId, task);

    expect(createdTask.correlationKey).toEqual("IAmSoUnique");
  });

  it("should return the correct location", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";

    let task: Task = {
      subject: "Some nice subject for your work",
      assignees: ["HereShouldStandAndUserOrGroupId"],
      correlationKey: "IAmSoUnique",
    };

    mockedAxios.post.mockResolvedValue({
      headers: {
        location: "some/location/uri/abcdefg"
      }
    });

    const createdTask: Task = await createTask(systemBaseUri, authessionId, task);

    expect(createdTask.location).toEqual("some/location/uri/abcdefg");
  });

  it("should throw error containing validation JSON", async () => {
    const validationJson = { someValue: false };
    mockedAxios.post.mockRejectedValue({ response: { status: 400, data: validationJson } });
    await expect(createTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", {})).rejects.toThrowError(`Task is invalid.\nValidation: ${JSON.stringify(validationJson)}`);
  });

  [
    { status: 401, error: "The user is not authenticated." },
    { status: 403, error: "The user is not eligible to create the task." },
  ].forEach(testCase => {
    it(`should throw "${testCase.error}" on status ${testCase.status}`, async () => {
      mockedAxios.post.mockRejectedValue({ response: { status: testCase.status } });
      await expect(createTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", {})).rejects.toThrowError(testCase.error);
    });
  });

  [100, 300, 414, 503].forEach(testCase => {
    it("should throw generic error on unknown status", async () => {
      const response = { response: { status: testCase, message: "HiItsMeError" } };
      mockedAxios.post.mockRejectedValue(response);

      await expect(createTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", {})).rejects.toThrowError(`Failed to create Task: ${JSON.stringify(response)}`);
    });
  });

  it("should throw generic error on unknown error", async () => {
    mockedAxios.post.mockRejectedValue({});
    await expect(createTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", {})).rejects.toThrowError(`Failed to create Task: ${JSON.stringify({})}`);
  });
});