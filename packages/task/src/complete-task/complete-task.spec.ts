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
});