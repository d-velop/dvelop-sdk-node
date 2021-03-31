import axios from "axios";
import { deleteTask } from "./delete-task";

jest.mock("axios");

describe("deleteTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockedAxios.delete.mockReset();
  });
  
  it("should make Delete with correct URI", async () => {
  
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const authessionId = "HiItsMeAuthsessionId";
    const id = "1234567890";
  
    await deleteTask(systemBaseUri, authessionId, id);
  
    expect(mockedAxios.delete).toBeCalledWith(`${systemBaseUri}/task/tasks/${id}`, expect.any(Object));
  });

  it("should make Delete with correct headers", async () => {

    const authessionId = "HiItsMeAuthsessionId";
    const systemBaseUri = "HiItsMeSystemBaseUri";
    const id = "1234567890";
  
    await deleteTask(systemBaseUri, authessionId, id);
  
    expect(mockedAxios.delete).toBeCalledWith(expect.any(String), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
  });
});