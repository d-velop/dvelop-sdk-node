import { validateAppSessionSignature, InvalidAppSessionSignatureError } from "../index";

describe("validateAppSessionSignature", () => {

  [
    { appName: "myapp", requestId: "123456789", authSessionId: "abcd1234=+-_", expire: "2021-07-27T02:46:16Z", sign: "9d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" },
    { appName: "acme-myapp", requestId: "987654321", authSessionId: "abcd1234=+-_", expire: "2020-0l-22T03:40:00Z", sign: "ab44ad010ce571cc819baaff18f986987c75e3315f06feb74d32276431fb0430" },
    { appName: "just", requestId: "some", authSessionId: "arbitrary", expire: "strings", sign: "74e877434f5963826d433c3298401e59b05c1283d277d58f28358b7674615177" }
  ].forEach(testCase => {
    it(`should pass for appName: '${testCase.appName}'`, () => {
      expect(() => validateAppSessionSignature(testCase.appName, testCase.requestId, testCase.authSessionId, testCase.expire, testCase.sign)).not.toThrow();
    });
  });

  [
    { appName: "myappwrong", requestId: "123456789", authSessionId: "abcd1234=+-_", expire: "2021-07-27T02:46:16Z", sign: "9d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" },
    { appName: "myapp", requestId: "1234567890", authSessionId: "abcd1234=+_", expire: "2021-07-27T02:46:16Z", sign: "9d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" },
    { appName: "myapp", requestId: "123456789", authSessionId: "abcd1234=+", expire: "2021-07-27T02:46:16Z", sign: "9d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" },
    { appName: "myapp", requestId: "123456789", authSessionId: "abcd1234=+-_", expire: "2021-07-27T02:46:00Z", sign: "9d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" },
    { appName: "myapp", requestId: "123456789", authSessionId: "abcd1234=+-_", expire: "2021-07-27T02:46:16Z", sign: "8d80381381aa85361612642063a4afb9bc758852118741d14b0fd2762a9cbe35" }
  ].forEach(testCase => {
    it(`should fail for appName: '${testCase.appName}'`, () => {

      let error: InvalidAppSessionSignatureError;

      try {
        validateAppSessionSignature(testCase.appName, testCase.requestId, testCase.authSessionId, testCase.expire, testCase.sign);
      } catch (e) {
        error = e;
      }

      expect(error instanceof InvalidAppSessionSignatureError).toBeTruthy();
    });
  });

});