
import { axiosFollowHalJsonFunctionFactory } from "./axios-follow-hal-json";
import { AxiosInstance, AxiosResponse } from "axios";
import { DvelopHttpRequestConfig } from "./http-client";
import { NotFoundError } from "..";

describe("axiosFollowHalJsonFunctionFactory", () => {

  let mockRequest = jest.fn();
  let mockAxiosInstance = {
    request: mockRequest
  } as unknown as AxiosInstance;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  [
    { testContext: "on one call", call: axiosFollowHalJsonFunctionFactory(mockAxiosInstance) },
    {
      testContext: "on multiple calls", call: async (config) => {
        const c1 = await axiosFollowHalJsonFunctionFactory(mockAxiosInstance)(config);
        const c2 = await axiosFollowHalJsonFunctionFactory(mockAxiosInstance)(c1);
        return await axiosFollowHalJsonFunctionFactory(mockAxiosInstance)(c2);
      }
    }
  ].forEach(test => {
    describe(`followHalJson on ${test.testContext}`, () => {

      [
        { follows: null, templates: null },
        { follows: [], templates: null },
        { follows: null, templates: {} },
        { follows: [], templates: {} },
      ].forEach(testCase => {
        it("should do nothing on empty follows and empty templates", async () => {
          const result = await test.call(testCase);
          expect(result).toBe(testCase);
          expect(mockAxiosInstance.request).toHaveBeenCalledTimes(0);
        });
      });

      describe("on follows", () => {

        it("should follow multiple links", async () => {

          const finalUrl: string = "HiItsMeFinalUrl";
          const config: DvelopHttpRequestConfig = {
            baseURL: "HiItsMeBaseUrl",
            url: "base",
            follows: ["1", "2", "3", "final"]
          };

          mockRequest.mockImplementation(config => {
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

          const resultConfig: DvelopHttpRequestConfig = await test.call(config);

          expect(resultConfig.url).toEqual(finalUrl);
          expect(resultConfig.follows).toBeUndefined();
          expect(mockRequest).toBeCalledTimes(4);
        });

        it("should make internal requests with GET and Accept-Header but return original config", async () => {
          const baseURL: string = "HiItsMeBaseUrl";
          const headers: any = { someHeader: "HiItsMeHeader" };
          const finalUrl: string = "HiItsMeFinalUrl";
          const config: DvelopHttpRequestConfig = {
            baseURL,
            headers,
            method: "POST",
            url: "base",
            follows: ["final"]
          };

          mockRequest.mockResolvedValue({ data: { _links: { "final": { href: finalUrl } } } });
          const resultConfig: DvelopHttpRequestConfig = await test.call(config);

          expect(resultConfig).toHaveProperty("baseURL", baseURL);
          expect(resultConfig).toHaveProperty("headers", headers);
          expect(resultConfig).toHaveProperty("method", "POST");
          expect(resultConfig).toHaveProperty("url", finalUrl);

          expect(mockRequest).toBeCalledWith(expect.objectContaining({
            baseURL: "HiItsMeBaseUrl",
            method: "GET",
            headers: expect.objectContaining({ "Accept": "application/hal+json, application/json" })
          }));
        });

        [
          { data: { _links: {} } },
          { data: { _links: { follow: "hi" } } }
        ].forEach(testCase => {
          it("throw error if no link for follow in _links is given", async () => {

            const config: DvelopHttpRequestConfig = {
              baseURL: "HiItsMeBaseUrl",
              url: "base",
              follows: ["follow"]
            };

            mockRequest.mockResolvedValue(testCase);
            let expectedError: NotFoundError;

            try {
              await test.call(config);
            } catch (e) {
              expectedError = e;
            }
            expect(expectedError instanceof NotFoundError).toBeTruthy();
            expect(expectedError.message).toContain("No hal-json link found for");
            expect(expectedError.message).toContain("follow");
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
          { url: "/test{?test1}", templates: { "test1": [] }, expectedUrl: "/test", expectedParams: {} },
          { url: "/test{?test1}", templates: { "test1": ["hi"] }, expectedUrl: "/test", expectedParams: { "test1": "[\"hi\"]" } },
          { url: "/test{?test1}", templates: { "test1": ["hi", "ho"] }, expectedUrl: "/test", expectedParams: { "test1": "[\"hi\",\"ho\"]" } },
          { url: "/test{?test1,test2}", templates: { "test1": ["hi", "ho"], "test2": ["1", "2"] }, expectedUrl: "/test", expectedParams: { "test1": "[\"hi\",\"ho\"]", "test2": "[\"1\",\"2\"]" } },

          { url: "a{B}c{D}e", templates: { D: "d" }, expectedUrl: "acde" },
          { url: "a{B}c{D}e", templates: {}, expectedUrl: "ace" },
          { url: "a{B}c{D}e", templates: null, expectedUrl: "ace" },
          { url: "a{B}c{D}e", templates: undefined, expectedUrl: "ace" },
          { url: "a{B}c{D}e", expectedUrl: "ace" },
          { url: "a{B}c{D}e", templates: { B: "b" }, expectedUrl: "abce" }
        ].forEach(testCase => {
          it(`should replace templates in "${testCase.url}" to "${testCase.expectedUrl}" for initial templating"`, async () => {

            const result: DvelopHttpRequestConfig = await test.call({
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

            mockRequest.mockResolvedValue(response);

            const result: DvelopHttpRequestConfig = await test.call({
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
});