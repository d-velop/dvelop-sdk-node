import axios from "axios";
import { createTask } from "./create-task";
import { Task } from "../task";

jest.mock("axios");

describe("createTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
    mockedAxios.post.mockResolvedValue({headers: {
      location: "some/location/uri/4711"
    }});
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

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
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

    expect(mockedAxios.post).toBeCalledWith(expect.any(String), task ,expect.any(Object));
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

    mockedAxios.post.mockResolvedValue({headers: {
      location: "some/location/uri/abcdefg"
    }});

    const createdTask: Task = await createTask(systemBaseUri, authessionId, task);

    expect(createdTask.location).toEqual("some/location/uri/abcdefg");
  });
});