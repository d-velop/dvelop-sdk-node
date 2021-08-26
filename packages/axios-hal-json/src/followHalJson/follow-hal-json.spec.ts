import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { followHalJson, HalJsonRequestChainError, NoHalJsonLinkToFollowError, NoHalJsonLinksInResponseError } from "../index";

jest.mock("axios");

[
  { testContext: "one call", call: followHalJson },
  {
    testContext: "multiple calls", call: async (config) => {
      const c1 = await followHalJson(config);
      const c2 = await followHalJson(c1);
      return await followHalJson(c2);
    }
  }
].forEach(test => {
  describe(`followHalJson on ${test.testContext}`, () => {

    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
      mockedAxios.request.mockReset();
    });

    [
      { follows: null, templates: null },
      { follows: [], templates: null },
      { follows: null, templates: {} },
      { follows: [], templates: {} },
    ].forEach(testCase => {
      it("should do nothing on empty follows and empty templates", async () => {
        const result = await test.call(testCase);
        expect(result).toBe(testCase);
        expect(mockedAxios.request).toHaveBeenCalledTimes(0);
      });
    });

    describe("on follows", () => {

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

        const resultConfig: AxiosRequestConfig = await test.call(config);

        expect(resultConfig.url).toEqual(finalUrl);
        expect(resultConfig.follows).toBeUndefined();
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
        const resultConfig: AxiosRequestConfig = await test.call(config);

        expect(resultConfig).toHaveProperty("baseURL", baseURL);
        expect(resultConfig).toHaveProperty("headers", headers);
        expect(resultConfig).toHaveProperty("method", "POST");
        expect(resultConfig).toHaveProperty("url", finalUrl);

        expect(mockedAxios.request).toBeCalledWith(expect.objectContaining({
          baseURL: "HiItsMeBaseUrl",
          method: "GET",
          headers: expect.objectContaining({ "Accept": "application/hal+json, application/json" })
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
          await test.call(config);
        } catch (e) {

          expectedError = e;
        }

        expect(expectedError instanceof HalJsonRequestChainError).toBeTruthy();
        expect(expectedError.requestError).toBe(error);
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
          await test.call(config);
        } catch (e) {
          expectedError = e;
        }
        expect(expectedError instanceof NoHalJsonLinksInResponseError).toBeTruthy();
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
            await test.call(config);
          } catch (e) {
            expectedError = e;
          }
          expect(expectedError instanceof NoHalJsonLinkToFollowError).toBeTruthy();
          expect(expectedError.response).toBe(testCase);
        });
      });
    });

    describe("on templates", () => {

      [
        { url: "No template", templates: {}, expectedUrl: "No template" },
        { url: "No template", templates: { "unneeded": "hi" }, expectedUrl: "No template" },
        { url: "{test}", templates: { "test": "hi" }, expectedUrl: "hi" },
        { url: "{test1}{test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "hiho" },
        { url: "{test1} {test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "hi ho" },
        { url: "{test1}{test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "hiho" },
        { url: "{test1}/{test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "hi/ho" },
        { url: "test{test1}/{test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "testhi/ho" },
        { url: "{test1}/{test2}test", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "hi/hotest" },
        { url: "!@#$%^^&*()_+{!!}", templates: { "!!": "hi" }, expectedUrl: "!@#$%^^&*()_+hi" },
        { url: "{test}", templates: { "test": "hi", "unneeded": "ho" }, expectedUrl: "hi" },

        { url: "{?test}", templates: { "test": "hi", "unneeded": "ho" }, expectedUrl: "", expectedParams: { "test": "hi" } },
        { url: "{?test1,test2}", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "", expectedParams: { "test1": "hi", "test2": "ho" } },
        { url: "{?test1,test2}", templates: { "test1": "hi", "unneeded": "ho" }, expectedUrl: "", expectedParams: { "test1": "hi" } },
        { url: "test{?test}test", templates: { "test": "hi", "unneeded": "ho" }, expectedUrl: "testtest", expectedParams: { "test": "hi" } },
        { url: "{?test1,test2}test", templates: { "test1": "hi", "test2": "ho" }, expectedUrl: "test", expectedParams: { "test1": "hi", "test2": "ho" } },
        { url: "test{?test1,test2}", templates: { "test1": "hi", "unneeded": "ho" }, expectedUrl: "test", expectedParams: { "test1": "hi" } },
        { url: "/test{?test1,test2}", templates: { "unneeded": "hi", "test2": "ho" }, expectedUrl: "/test", expectedParams: { "test2": "ho" } },
        { url: "/test{?}", templates: { "unneeded": "hi" }, expectedUrl: "/test", expectedParams: {} },

        { url: "a{B}c{D}e", templates: { D: "d" }, expectedUrl: "acde" },
        { url: "a{B}c{D}e", templates: {}, expectedUrl: "ace" },
        { url: "a{B}c{D}e", templates: null, expectedUrl: "ace" },
        { url: "a{B}c{D}e", templates: undefined, expectedUrl: "ace" },
        { url: "a{B}c{D}e", expectedUrl: "ace" },
        { url: "a{B}c{D}e", templates: { B: "b" }, expectedUrl: "abce" }
      ].forEach(testCase => {

        const mockedAxios = axios as jest.Mocked<typeof axios>;

        beforeEach(() => {
          mockedAxios.get.mockReset();
        });

        it(`should replace templates in "${testCase.url}" to "${testCase.expectedUrl}" for initial templating"`, async () => {

          const result: AxiosRequestConfig = await test.call({
            url: testCase.url,
            templates: testCase.templates
          });

          expect(result.url).toEqual(testCase.expectedUrl);
          expect(result.params).toEqual(testCase.expectedParams || {});
        });

        it(`should replace templates in "${testCase.url}" to "${testCase.expectedUrl} for response templating"`, async () => {

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

          const result: AxiosRequestConfig = await test.call({
            follows: ["follow"],
            templates: testCase.templates
          });
          expect(result.url).toEqual(testCase.expectedUrl);
          expect(result.params).toEqual(testCase.expectedParams || {});
        });
      });
    });
  });
});