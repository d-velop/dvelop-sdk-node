import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { HalJsonRequestChainError, NoHalJsonLinkToFollowError, NoHalJsonLinksInResponseError, NoHalJsonTemplateValueError } from "../errors";
import { followHalJson } from "./follow-hal-json";

jest.mock("axios");

describe("followHalJson", () => {

  [
    { follows: null, templates: null },
    { follows: [], templates: null },
    { follows: null, templates: {} },
    { follows: [], templates: {} },
  ].forEach(testCase => {
    it("should do nothing on empty follows and empty templates", async () => {
      const result = await followHalJson(testCase);
      expect(result).toBe(testCase);
    });
  });

  describe("on follows", () => {

    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
      mockedAxios.get.mockReset();
    });

    it("should follow multiple links", async () => {

      const finalUrl: string = "HiItsMeFinalUrl";
      const config: AxiosRequestConfig = {
        baseURL: "HiItsMeBaseUrl",
        url: "base",
        follows: ["1", "2", "3", "final"]
      };

      mockedAxios.request.mockImplementation(config => {
        switch (config.url) {
        case "base":
          return Promise.resolve({ data: { _links: { "1": { href: "one" } } } });
        case "one":
          return Promise.resolve({ data: { _links: { "2": { href: "two" } } } });
        case "two":
          return Promise.resolve({ data: { _links: { "3": { href: "three" } } } });
        case "three":
          return Promise.resolve({ data: { _links: { "final": { href: finalUrl } } } });
        default:
          return Promise.reject(new Error());
        }
      });

      const resultConfig: AxiosRequestConfig = await followHalJson(config);

      expect(resultConfig.url).toEqual(finalUrl);
      expect(mockedAxios.request).toBeCalledTimes(4);

    });

    it("should make internal requests with GET and Accept-Header but return original config", async () => {
      const baseURL: string = "HiItsMeBaseUrl";
      const headers: any = { someHeader: "HiItsMeHeader" };
      const finalUrl: string = "HiItsMeFinalUrl";
      const config: AxiosRequestConfig = {
        baseURL,
        headers,
        method: "POST",
        url: "base",
        follows: ["final"]
      };

      mockedAxios.request.mockResolvedValue({ data: { _links: { "final": { href: finalUrl } } } });
      const resultConfig: AxiosRequestConfig = await followHalJson(config);

      expect(resultConfig.method).toEqual("POST");
      expect.objectContaining({
        baseURL,
        headers,
        method: "POST",
        url: finalUrl
      });

      expect(mockedAxios.request).toBeCalledWith(expect.objectContaining({
        baseURL: "HiItsMeBaseUrl",
        method: "GET",
        headers: { "Accept": "application/hal+json, application/json" }
      }));
    });

    it("throw error on axios error", async () => {

      const config: AxiosRequestConfig = {
        baseURL: "HiItsMeBaseUrl",
        url: "base",
        follows: ["follow"]
      };

      const error: any = { error: "Some Error" };
      let expectedError: HalJsonRequestChainError;

      mockedAxios.request.mockRejectedValue(error);
      try {
        await followHalJson(config);
      } catch (e) {

        expectedError = e;
      }

      expect(expectedError instanceof HalJsonRequestChainError).toBeTruthy();
      expect(expectedError.config).toBeTruthy();
      expect(expectedError.originalError).toBe(error);
    });

    it("throw error if no _links are given", async () => {

      const config: AxiosRequestConfig = {
        baseURL: "HiItsMeBaseUrl",
        url: "base",
        follows: ["follow"]
      };

      const response: AxiosResponse = { data: {} } as AxiosResponse;
      let expectedError: NoHalJsonLinksInResponseError;

      mockedAxios.request.mockResolvedValue(response);
      try {
        await followHalJson(config);
      } catch (e) {
        expectedError = e;
      }
      expect(expectedError instanceof NoHalJsonLinksInResponseError).toBeTruthy();
      expect(expectedError.config).toBeTruthy();
      expect(expectedError.response).toBe(response);
    });

    [
      { data: { _links: {} } },
      { data: { _links: { follow: "hi" } } }
    ].forEach(testCase => {
      it("throw error if no link for follow in _links is given", async () => {

        const config: AxiosRequestConfig = {
          baseURL: "HiItsMeBaseUrl",
          url: "base",
          follows: ["follow"]
        };

        mockedAxios.request.mockResolvedValue(testCase);
        let expectedError: NoHalJsonLinkToFollowError;

        try {
          await followHalJson(config);
        } catch (e) {
          expectedError = e;
        }
        expect(expectedError instanceof NoHalJsonLinkToFollowError).toBeTruthy();
        expect(expectedError.follow).toEqual("follow");
        expect(expectedError.config).toBeTruthy();
        expect(expectedError.response).toBe(testCase);
      });
    });
  });

  describe("on templates", () => {

    [
      { url: "No template", templates: {}, expected: "No template" },
      { url: "No template", templates: { "unneeded": "hi" }, expected: "No template" },
      { url: "{test}", templates: { "test": "hi" }, expected: "hi" },
      { url: "{test1}{test2}", templates: { "test1": "hi", "test2": "ho" }, expected: "hiho" },
      { url: "{test1} {test2}", templates: { "test1": "hi", "test2": "ho" }, expected: "hi ho" },
      { url: "{test1}{test2}", templates: { "test1": "hi", "test2": "ho" }, expected: "hiho" },
      { url: "{test1}/{test2}", templates: { "test1": "hi", "test2": "ho" }, expected: "hi/ho" },
      { url: "test{test1}/{test2}", templates: { "test1": "hi", "test2": "ho" }, expected: "testhi/ho" },
      { url: "{test1}/{test2}test", templates: { "test1": "hi", "test2": "ho" }, expected: "hi/hotest" },
      { url: "!@#$%^^&*()_+{!!}", templates: { "!!": "hi" }, expected: "!@#$%^^&*()_+hi" },
      { url: "{test}", templates: { "test": "hi", "unneeded": "ho" }, expected: "hi" },
    ].forEach(testCase => {

      const mockedAxios = axios as jest.Mocked<typeof axios>;

      beforeEach(() => {
        mockedAxios.get.mockReset();
      });

      it(`should replace templates in "${testCase.url}" to "${testCase.expected} for initial templating"`, async () => {

        const result: AxiosRequestConfig = await followHalJson({
          url: testCase.url,
          templates: testCase.templates
        });

        expect(result.url).toEqual(testCase.expected);
      });

      it(`should replace templates in "${testCase.url}" to "${testCase.expected} for response templating"`, async () => {

        const response: AxiosResponse = {
          data: {
            _links: {
              follow: {
                href: testCase.url
              }
            }
          }
        } as AxiosResponse;

        mockedAxios.request.mockResolvedValue(response);

        const result: AxiosRequestConfig = await followHalJson({
          follows: ["follow"],
          templates: testCase.templates
        });
        expect(result.url).toEqual(testCase.expected);
      });


    });

    [
      { url: "a{B}c{D}e", templates: { D: "d" }, failTemplate: "{B}", failUrl: "a{B}c{D}e" },
      { url: "a{B}c{D}e", templates: {}, failTemplate: "{B}", failUrl: "a{B}c{D}e" },
      { url: "a{B}c{D}e", templates: null, failTemplate: "{B}", failUrl: "a{B}c{D}e" },
      { url: "a{B}c{D}e", templates: undefined, failTemplate: "{B}", failUrl: "a{B}c{D}e" },
      { url: "a{B}c{D}e", failTemplate: "{B}", failUrl: "a{B}c{D}e" },
      { url: "a{B}c{D}e", templates: { B: "b" }, failTemplate: "{D}", failUrl: "abc{D}e" }
    ].forEach(testCase => {

      const mockedAxios = axios as jest.Mocked<typeof axios>;

      beforeEach(() => {
        mockedAxios.get.mockReset();
      });


      it("should throw NoHalJsonTemplateValueError if missing template for response templating", async () => {

        const config: AxiosRequestConfig = {
          baseURL: "HiItsMeBaseUrl",
          url: testCase.url,
          templates: testCase.templates
        };

        let expectedError: NoHalJsonTemplateValueError;

        try {
          await followHalJson(config);
        } catch (e) {
          expectedError = e;
        }
        expect(expectedError instanceof NoHalJsonTemplateValueError).toBeTruthy();
        expect(expectedError.template).toEqual(testCase.failTemplate);
        expect(expectedError.followUrl).toEqual(testCase.failUrl);
        expect(expectedError.config).toEqual(config);
      });

      it("should throw NoHalJsonTemplateValueError if missing template for initial templating", async () => {

        const config: AxiosRequestConfig = {
          follows: ["follow"],
          templates: testCase.templates
        };

        const response: AxiosResponse = {
          data: {
            _links: {
              follow: {
                href: testCase.url
              }
            }
          }
        } as AxiosResponse;

        mockedAxios.request.mockResolvedValue(response);
        let expectedError: NoHalJsonTemplateValueError;

        try {
          await followHalJson(config);
        } catch (e) {
          expectedError = e;
        }

        expect(expectedError instanceof NoHalJsonTemplateValueError).toBeTruthy();
        expect(expectedError.template).toEqual(testCase.failTemplate);
        expect(expectedError.followUrl).toEqual(testCase.failUrl);
        expect(expectedError.config).toBeTruthy();
      });
    });
  });
});