import axios from "axios";
import { Task } from "../task";
import { deleteTask } from "./delete-task";

jest.mock("axios");

describe("deleteTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.delete.mockReset();
  });

  [
    "", null, undefined
  ].forEach(testCase => {

    it("should throw on missing location as string", async () => {

      const systemBaseUri = "HiItsMeSystemBaseUri";
      const authessionId = "HiItsMeAuthsessionId";

      await expect(deleteTask(systemBaseUri, authessionId, testCase)).rejects.toThrowError("Failed to delete Task.\nNo Location");
    });

    it("should throw on missing location in task", async () => {

      const systemBaseUri = "HiItsMeSystemBaseUri";
      const authessionId = "HiItsMeAuthsessionId";
      const task: Task = {
        location: testCase,
        subject: "Nice Subject",
        description: "a description",
      };

      await expect(deleteTask(systemBaseUri, authessionId, task)).rejects.toThrowError("Failed to delete Task.\nNo Location");
    });
  });

  it("should make Delete with correct URI with location given", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const location = "/it/is/a/location/1234567890";

    await deleteTask(systemBaseUri, authessionId, location);

    expect(mockedAxios.delete).toBeCalledWith(`${systemBaseUri}${location}`, expect.any(Object));
  });

  it("should make Delete with correct URI with task object given", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const myTask: Task = {
      location: "/it/is/a/location/1234567890",
      subject: "Nice Subject",
      description: "a description",
    };

    await deleteTask(systemBaseUri, authessionId, myTask);

    expect(mockedAxios.delete).toBeCalledWith(`${systemBaseUri}${myTask.location}`, expect.any(Object));
  });

  it("should make Delete with correct headers", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const location = "/it/is/a/location/1234567890";

    await deleteTask(systemBaseUri, authessionId, location);

    expect(mockedAxios.delete).toBeCalledWith(expect.any(String), { headers: { "Authorization": `Bearer ${authessionId}`, "Origin": systemBaseUri } });
  });

  [
    { status: 401, error: "The user is not authenticated." },
    { status: 403, error: "The user does not have the permission to delete this task." },
    { status: 404, error: "The task does not exist." },
  ].forEach(testCase => {
    it(`should throw "${testCase.error}" on status ${testCase.status}`, async () => {
      mockedAxios.delete.mockRejectedValue({ response: { status: testCase.status } });
      await expect(deleteTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(testCase.error);
    });
  });

  [100, 300, 414, 503].forEach(testCase => {
    it("should throw generic error on unknown status", async () => {
      const response = { response: { status: testCase, message: "HiItsMeError" } };
      mockedAxios.delete.mockRejectedValue(response);

      await expect(deleteTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(`Failed to delete Task: ${JSON.stringify(response)}`);
    });
  });

  it("should throw generic error on unknown error", async () => {
    mockedAxios.delete.mockRejectedValue({});
    await expect(deleteTask("HiItsMeAuthsessionId", "HiItsMeAuthsessionId", "/task/taks/1234567890")).rejects.toThrowError(`Failed to delete Task: ${JSON.stringify({})}`);
  });
});