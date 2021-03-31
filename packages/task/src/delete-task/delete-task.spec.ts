import axios from "axios";
import { Task } from "../task";
import { deleteTask } from "./delete-task";

jest.mock("axios");

describe("deleteTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    mockedAxios.delete.mockReset();
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
    const myTask:Task = {
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
  
    expect(mockedAxios.delete).toBeCalledWith(expect.any(String), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
  });
});