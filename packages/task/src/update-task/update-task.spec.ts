import axios, { AxiosResponse } from "axios";
import { Task } from "../index";
import { InvalidTaskError, NoTaskLocationError, TaskAlreadyCompletedError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError } from "../index";
import { updateTask } from "../index";

jest.mock("axios");

describe("updateTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.patch.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.patch.mockResolvedValue(null);
    });

    it("should send PATCH", async () => {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });

    it("should send to location", async () => {
      const location: string = "HiItsMeLocation";
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: location });
      expect(mockedAxios.patch).toHaveBeenCalledWith(location, expect.any(Object), expect.any(Object));
    });

    it("should send with given task", async () => {
      const task: Task = { location: "HiItsMeLocation", subject: "HiItsMeSubject", correlationKey: "HiItsMeCorrelationKey" };
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { ...task });
      expect(mockedAxios.patch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining(task), expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await updateTask(systemBaseUri, "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
      expect(mockedAxios.patch).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await updateTask("HiItsMeSystemBaseUri", authSessionId, { location: "HiItsMeLocation" });
      expect(mockedAxios.patch).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with systemBaseUri as Origin-Header", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await updateTask(systemBaseUri, "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
      expect(mockedAxios.patch).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Origin": systemBaseUri })
      }));
    });
  });

  describe("errors", () => {

    [
      "",
      null,
      undefined
    ].forEach(testCase => {
      it(`should throw NoTaskLocationError on location=${testCase}`, async () => {

        const task: Task = { location: "" };
        let error: NoTaskLocationError;

        try {
          await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", task);
        } catch (e) {
          error = e;
        }

        expect(error instanceof NoTaskLocationError).toBeTruthy();
        expect(error.message).toContain("Failed to update task");
        expect(error.task).toEqual(task);
        expect(mockedAxios.delete).toHaveBeenCalledTimes(0);
      });
    });
  });

  it("should throw InvalidTaskError on status 400", async () => {

    const task: Task = {
      location: "HiItsMeLocation",
      subject: "HiItsMeSubject",
      context: { name: "HiItsMeContext" }
    };

    const data: any = { hiitsme: "ValidationJson" };

    const response: AxiosResponse = {
      data,
      status: 400,
    } as AxiosResponse;

    mockedAxios.patch.mockRejectedValue({ response });

    let error: InvalidTaskError;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", task);
    } catch (e) {
      error = e;
    }

    expect(error instanceof InvalidTaskError).toBeTruthy();
    expect(error.message).toContain("Failed to update task");
    expect(error.task).toEqual(expect.objectContaining(task));
    expect(error.validation).toEqual(data);
    expect(error.response).toEqual(response);
  });

  it("should throw UnauthenticatedError on status 401", async () => {

    const response: AxiosResponse = {
      data: {},
      status: 401,
    } as AxiosResponse;

    mockedAxios.patch.mockRejectedValue({ response });

    let error: UnauthenticatedError;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
    } catch (e) {
      error = e;
    }

    expect(error instanceof UnauthenticatedError).toBeTruthy();
    expect(error.message).toContain("Failed to update task:");
    expect(error.response).toEqual(response);
  });

  it("should throw UnauthorizedError on status 403", async () => {

    const response: AxiosResponse = {
      data: {},
      status: 403,
    } as AxiosResponse;

    mockedAxios.patch.mockRejectedValue({ response });

    let error: UnauthorizedError;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
    } catch (e) {
      error = e;
    }

    expect(error instanceof UnauthorizedError).toBeTruthy();
    expect(error.message).toContain("Failed to update task:");
    expect(error.response).toEqual(response);
  });

  it("should throw TaskNotFoundError on status 404", async () => {

    const location = "HiItsMeLocation";

    const response: AxiosResponse = {
      status: 404,
    } as AxiosResponse;

    mockedAxios.patch.mockRejectedValue({ response });

    let error: TaskNotFoundError;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: location });
    } catch (e) {
      error = e;
    }

    expect(error instanceof TaskNotFoundError).toBeTruthy();
    expect(error.message).toContain("Failed to update task:");
    expect(error.message).toContain(location);
    expect(error.location).toEqual(location);
    expect(error.response).toEqual(response);
  });

  it("should throw TaskAlreadyCompletedError on status 410", async () => {

    const location = "HiItsMeLocation";

    const response: AxiosResponse = {
      status: 410,
    } as AxiosResponse;

    mockedAxios.patch.mockRejectedValue({ response });

    let error: TaskAlreadyCompletedError;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: location });
    } catch (e) {
      error = e;
    }

    expect(error instanceof TaskAlreadyCompletedError).toBeTruthy();
    expect(error.message).toContain("Failed to update task:");
    expect(error.location).toEqual(location);
    expect(error.response).toEqual(response);
  });

  it("should throw UnknownErrors", async () => {

    const errorString: string = "HiItsMeError";
    const error: Error = new Error(errorString);
    mockedAxios.patch.mockImplementation(() => {
      throw error;
    });

    let resultError: Error;
    try {
      await updateTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", { location: "HiItsMeLocation" });
    } catch (e) {
      resultError = e;
    }

    expect(resultError).toBe(error);
    expect(resultError.message).toContain(errorString);
    expect(resultError.message).toContain("Failed to update task:");
  });
});