import axios, { AxiosResponse } from "axios";
import "@dvelop-sdk/axios-hal-json";
import { createTask, InvalidTaskError } from "./create-task";
import { Task } from "../task";
import { UnauthenticatedError, UnauthorizedError } from "../errors";

jest.mock("axios");

describe("createTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({
        headers: { location: "HiItsMeLocations" }
      });
    });

    it("should do POST", async () => {
      await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should POST to /task", async () => {
      await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      expect(mockedAxios.post).toHaveBeenCalledWith("/task", expect.any(Object), expect.any(Object));
    });

    it("should POST with given task", async () => {
      const task: Task = { subject: "HiItsMeSubject", correlationKey: "HiItsMeCorrelationKey" };
      await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { ...task });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining(task), expect.any(Object));
    });

    it("should POST given task with added correlationKey if none given", async () => {
      const task: Task = { subject: "HiItsMeSubject" };
      await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { ...task });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining(task), expect.any(Object));
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ correlationKey: expect.any(String) }), expect.any(Object));
    });

    it("should POST with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await createTask(systemBaseUri, "HiItsMeAuthSessionId", {});
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should POST with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await createTask("HiItsMeSystemBaseUri", authSessionId, {});
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should POST with systemBaseUri as Origin-Header", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await createTask(systemBaseUri, "HiItsMeAuthSessionId", {});
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Origin": systemBaseUri })
      }));
    });

    it("should POST with follows: tasks", async () => {
      await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        follows: ["tasks"]
      }));
    });
  });

  describe("response", () => {

    it("should return task", async () => {

      const task: Task = {
        subject: "HiItsMeSubject",
        context: { name: "HiItsMeContext" }
      };

      mockedAxios.post.mockResolvedValue({
        headers: { location: "HiItsMeLocations" }
      });

      const result: Task = await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", task);
      expect(result).toEqual(expect.objectContaining(task));
    });

    it("should set location from header", async () => {

      const location: string = "HiItsMeLocation";

      mockedAxios.post.mockResolvedValue({
        headers: { location: location }
      });

      const result: Task = await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      expect(result).toEqual(expect.objectContaining({ location: location }));
    });

    it("should set correlationKey", async () => {

      const location: string = "HiItsMeLocation";

      mockedAxios.post.mockResolvedValue({
        headers: { location: location }
      });

      const result: Task = await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      expect(result).toEqual(expect.objectContaining({ correlationKey: expect.any(String) }));
    });
  });

  describe("errors", () => {

    it("should throw InvalidTaskError on status 400", async () => {

      const task: Task = {
        subject: "HiItsMeSubject",
        context: { name: "HiItsMeContext" }
      };

      const data: any = { hiitsme: "ValidationJson" };

      const response: AxiosResponse = {
        data,
        status: 400,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: InvalidTaskError;
      try {
        await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", task);
      } catch (e) {
        error = e;
      }

      expect(error instanceof InvalidTaskError).toBeTruthy();
      expect(error.message).toContain("Failed to create Task:");
      expect(error.task).toEqual(expect.objectContaining(task));
      expect(error.validation).toEqual(data);
      expect(error.response).toEqual(response);
    });

    it("should throw UnauthenticatedError on status 401", async () => {

      const response: AxiosResponse = {
        data: {},
        status: 401,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: UnauthenticatedError;
      try {
        await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthenticatedError).toBeTruthy();
      expect(error.message).toContain("Failed to create Task:");
      expect(error.response).toEqual(response);
    });

    it("should throw UnauthorizedError on status 403", async () => {

      const response: AxiosResponse = {
        data: {},
        status: 403,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: UnauthorizedError;
      try {
        await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to create Task:");
      expect(error.response).toEqual(response);
    });


    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.post.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await createTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {});
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to create Task:");
    });
  });
});