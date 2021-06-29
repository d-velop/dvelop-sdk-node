import { getLoginRedirectionUri } from "../index";

describe("getLoginUri", () => {
  [
    { successUri: "HiItsMeOriginalUri", expected: "/identityprovider/login?redirect=HiItsMeOriginalUri" },
    { successUri: "https://some.uri", expected: "/identityprovider/login?redirect=https%3A%2F%2Fsome.uri" },
  ].forEach(testCase => {

    it(`should return '${testCase.expected}' for redirect '${testCase.successUri}'`, () => {
      const result = getLoginRedirectionUri(testCase.successUri);
      expect(result.toString()).toEqual(testCase.expected);
    });
  });
});