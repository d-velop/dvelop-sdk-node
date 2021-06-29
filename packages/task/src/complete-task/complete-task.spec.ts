import axios, { AxiosResponse } from "axios";
import { NoTaskLocationError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError, TaskAlreadyCompletedError } from "../index";
import { completeTask } from "../index";

jest.mock("axios");

describe("completeTask", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  [
    "HiItsMeLocation",
    { location: "HiItsMeLocation" }
  ].forEach(testCase => {

    describe(`http-call with location ${typeof testCase === "string" ? "as string" : "in task"}`, () => {

      beforeEach(() => {
        mockedAxios.post.mockResolvedValue(null);
      });

      it("should do POST", async () => {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", testCase);
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });

      it("should POST to location", async () => {
        const location: string = typeof testCase === "string" ? testCase : testCase.location;
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", testCase);
        expect(mockedAxios.post).toHaveBeenCalledWith(`${location}/completionState`, expect.any(Object), expect.any(Object));
      });

      it("should POST with given { complete: true }", async () => {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", testCase);
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), { complete: true }, expect.any(Object));
      });

      it("should POST with systemBaseUri as BaseURL", async () => {
        const systemBaseUri: string = "HiItsMeSystemBaseUri";
        await completeTask(systemBaseUri, "HiItsMeAuthSessionId", testCase);
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
          baseURL: systemBaseUri
        }));
      });

      it("should POST with authSessionId as Authorization-Header", async () => {
        const authSessionId: string = "HiItsMeAuthSessionId";
        await completeTask("HiItsMeSystemBaseUri", authSessionId, testCase);
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
          headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
        }));
      });

      it("should POST with systemBaseUri as Origin-Header", async () => {
        const systemBaseUri: string = "HiItsMeSystemBaseUri";
        await completeTask(systemBaseUri, "HiItsMeAuthSessionId", testCase);
        expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
          headers: expect.objectContaining({ "Origin": systemBaseUri })
        }));
      });
    });
  });


  describe("errors", () => {

    [
      "",
      null,
      undefined
    ].forEach(testCaseLocation => {
      [
        testCaseLocation,
        { location: testCaseLocation }
      ].forEach(testCaseTask => {
        it(`should throw NoTaskLocationError on location=${testCaseLocation} ${typeof testCaseTask === "string" ? "as string" : "in task"}`, async () => {

          let error: NoTaskLocationError;
          try {
            await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", testCaseTask);
          } catch (e) {
            error = e;
          }

          expect(error instanceof NoTaskLocationError).toBeTruthy();
          expect(error.message).toContain("Failed to complete task");
          expect(error.task).toEqual(testCaseTask);
          expect(mockedAxios.post).toHaveBeenCalledTimes(0);
        });
      });
    });

    it("should throw UnauthenticatedError on status 401", async () => {

      const response: AxiosResponse = {
        status: 401
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: UnauthenticatedError;
      try {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeLocation");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthenticatedError).toBeTruthy();
      expect(error.message).toContain("Failed to complete task:");
      expect(error.response).toEqual(response);
    });


    it("should throw UnauthorizedError on status 403", async () => {

      const response: AxiosResponse = {
        status: 403,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: UnauthorizedError;
      try {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeLocation");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to complete task:");
      expect(error.response).toEqual(response);
    });

    it("should throw TaskNotFoundError on status 404", async () => {

      const location = "HiItsMeLocation";

      const response: AxiosResponse = {
        status: 404,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: TaskNotFoundError;
      try {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", location);
      } catch (e) {
        error = e;
      }

      expect(error instanceof TaskNotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to complete task:");
      expect(error.message).toContain(location);
      expect(error.location).toEqual(location);
      expect(error.response).toEqual(response);
    });

    it("should throw TaskAlreadyCompletedError on status 410", async () => {

      const location = "HiItsMeLocation";

      const response: AxiosResponse = {
        status: 410,
      } as AxiosResponse;

      mockedAxios.post.mockRejectedValue({ response });

      let error: TaskAlreadyCompletedError;
      try {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", location);
      } catch (e) {
        error = e;
      }

      expect(error instanceof TaskAlreadyCompletedError).toBeTruthy();
      expect(error.message).toContain("Failed to complete task:");
      expect(error.location).toEqual(location);
      expect(error.response).toEqual(response);
    });

    it("should rethrow with added context on unknown error", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.post.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await completeTask("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeLocation");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to complete task:");
    });
  });
});