import axios from "axios";
import { completeTask } from "./complete-task";

jest.mock("axios");

describe("completeTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockedAxios.post.mockReset();
  });
  
  it("should make POST with correct URI", async () => {
  
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const id = "1234567890";
  
    await completeTask(systemBaseUri, authessionId, id);
  
    expect(mockedAxios.post).toBeCalledWith(`${systemBaseUri}/task/tasks/${id}/completionState`, expect.any(Object), expect.any(Object));
  });

  it("should make POST with correct headers", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const id = "1234567890";
  
    await completeTask(systemBaseUri, authessionId, id);
  
    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
  });

  it("should make POST with correct body", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const id = "1234567890";

    const expectedBody = {"complete" : true};

  
    await completeTask(systemBaseUri, authessionId, id);
  
    expect(mockedAxios.post).toBeCalledWith(expect.any(String), expectedBody ,expect.any(Object));
  });
});