import axios from "axios";
import { Task } from "../task";
import { completeTask } from "./complete-task";

jest.mock("axios");

describe("completeTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  [
    "", null, undefined
  ].forEach(testCase => {

    it("should throw on missing location as string", async () => {

      const systemBaseUri = "HiItsMeSystemBaseUri";
      const authessionId = "HiItsMeAuthsessionId";

      await expect(completeTask(systemBaseUri, authessionId, testCase)).rejects.toThrowError("Failed to complete Task.\nNo Location");
    });

    it("should throw on missing location in task", async () => {

      const systemBaseUri = "HiItsMeSystemBaseUri";
      const authessionId = "HiItsMeAuthsessionId";
      const task: Task = {
        location: testCase,
        subject: "Nice Subject",
        description: "a description",
      };

      await expect(completeTask(systemBaseUri, authessionId, task)).rejects.toThrowError("Failed to complete Task.\nNo Location");
    });
  });

  it("should make POST with correct URI with location given", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const location = "/task/taks/1234567890";

    await completeTask(systemBaseUri, authessionId, location);

    expect(mockedAxios.post).toBeCalledWith(`${systemBaseUri}${location}/completionState`, expect.any(Object), expect.any(Object));
  });

  it("should make POST with correct URI with task object given", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const myTask: Task = {
      location: "/it/is/a/location/1234567890",
      subject: "Nice Subject",
      description: "a description",
    };

    await completeTask(systemBaseUri, authessionId, myTask);

    expect(mockedAxios.post).toBeCalledWith(`${systemBaseUri}${myTask.location}/completionState`, expect.any(Object), expect.any(Object));
  });

  it("should make POST with correct headers", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const location = "/task/taks/1234567890";

    await completeTask(systemBaseUri, authessionId, location);

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}`, "Origin": systemBaseUri } });
  });

  it("should make POST with correct body", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const location = "/task/taks/1234567890";

    const expectedBody = { "complete": true };


    await completeTask(systemBaseUri, authessionId, location);

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expectedBody, expect.any(Object));
  });

  [
    { status: 401, error: "The user is not authenticated." },
    { status: 403, error: "The user does not have the permission to complete this task." },
    { status: 404, error: "The task does not exist." },
    { status: 410, error: "This task was already completed." }
  ].forEach(testCase => {
    it(`should throw "${testCase.error}" on status ${testCase.status}`, async () => {
      mockedAxios.post.mockRejectedValue({ response: { status: testCase.status } });
      await expect(completeTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(testCase.error);
    });
  });

  [100, 300, 414, 503].forEach(testCase => {
    it("should throw generic error on unknown status", async () => {
      const response = { response: { status: testCase, message: "HiItsMeError" } };
      mockedAxios.post.mockRejectedValue(response);

      await expect(completeTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(`Failed to create Task: ${JSON.stringify(response)}`);
    });
  });

  it("should throw generic error on unknown error", async () => {
    mockedAxios.post.mockRejectedValue({});
    await expect(completeTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(`Failed to create Task: ${JSON.stringify({})}`);
  });
});