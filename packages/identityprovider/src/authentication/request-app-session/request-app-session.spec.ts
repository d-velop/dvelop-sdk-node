import axios from "axios";
import { requestAppSession } from "../../index";

jest.mock("axios");

describe("requestAppSession", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.post.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({});
    });

    it("should send POST", async () => {
      await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should send to /identityprovider/appsession", async () => {
      await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith("/identityprovider/appsession", expect.any(Object), expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await requestAppSession(systemBaseUri, "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with correct appName in body", async () => {
      const appName: string = "HiItsMeAppName";
      await requestAppSession("HiItsMeSystemBaseUri", appName, "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        appname: appName,
      }), expect.any(Object));
    });

    it("should send with correct callback in body", async () => {
      const callback: string = "HiItsMeCallback";
      await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", callback, "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        callback: callback,
      }), expect.any(Object));
    });

    it("should send with correct requestId body", async () => {
      const requestId: string = "HiItsMeRequestId";
      await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", "HiItsMeCallback", requestId);
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        requestid: requestId
      }), expect.any(Object));
    });

    it("should send with ContentType-Header: application/json", async () => {
      await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" })
      }));
    });

    it("should send with Origin-Header: systemBaseUri", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await requestAppSession(systemBaseUri, "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({ "Origin": systemBaseUri })
      }));
    });
  });

  describe("errors", () => {

    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.post.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await requestAppSession("HiItsMeSystemBaseUri", "HiItsMeAppName", "HiItsMeCallback", "HiItsMeRequestId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to request appSession:");
    });
  });
});