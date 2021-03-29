import axios from "axios";
import { updateTask } from "./update-task";
import { Task } from "../task";

jest.mock("axios");

describe("updateTask", () => {

    const mockedAxios = axios as jest.Mocked<typeof axios>;
  
    beforeEach(() => {
      mockedAxios.patch.mockReset();
    });

    let task:Task = {
      subject: "Let us change the subject",
      description: "My nice updated description"
    };
  
    it("should make PATCH with correct URI", async () => {
  
      const systemBaseUri = "HiItsMeSystemBaseUri";
      const id = "1234567890";
  
      await updateTask(systemBaseUri, "HiItsMeAuthSessionId", id ,task);
  
      expect(mockedAxios.patch).toBeCalledWith(`${systemBaseUri}/task/tasks/${id}`, expect.any(Object), expect.any(Object));
    });

    it("should make PATCH with correct headers", async () => {

      const authessionId = "HiItsMeAuthsessionId";
      const systemBaseUri = "HiItsMeSystemBaseUri";
      const id = "1234567890";
  
      await updateTask(systemBaseUri, authessionId, id, task);
  
      expect(mockedAxios.patch).toBeCalledWith(expect.any(String), expect.any(Object), { headers: { "Authorization": `Bearer ${authessionId}` , "Origin" : systemBaseUri} });
    });

    it("should make PATCH with correct body", async () => {

      const authessionId = "HiItsMeAuthsessionId";
      const systemBaseUri = "HiItsMeSystemBaseUri";
      const id = "1234567890";
  
      await updateTask(systemBaseUri, authessionId, id, task);
  
      expect(mockedAxios.patch).toBeCalledWith(expect.any(String), task ,expect.any(Object));
    });
});