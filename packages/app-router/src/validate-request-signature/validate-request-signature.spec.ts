import { validateRequestSignature, InvalidRequestSignatureError } from "../index";
import { validateDvelopContext } from "./validate-request-signature";

describe("validateRequestSignature", () => {
  [
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRg=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    }
  ].forEach(testCase => {
    it(`should pass on: ${JSON.stringify(testCase)})`, () => {
      expect(() => validateRequestSignature(testCase.appSecret, testCase.systemBaseUri, testCase.tenantId, testCase.signature)).not.toThrowError();
    });

    it(`should pass on: ${JSON.stringify(testCase)})`, () => {
      expect(() => validateDvelopContext(testCase.appSecret, { systemBaseUri: testCase.systemBaseUri, tenantId: testCase.tenantId, requestSignature: testCase.signature })).not.toThrowError();
    });
  });

  it("should throw InvalidRequestSignatureError on empty context", () => {

    let error: InvalidRequestSignatureError;
    try {
      validateDvelopContext("someSecret", {});
    } catch (e) {
      error = e;
    }

    expect(error instanceof InvalidRequestSignatureError).toBeTruthy();
    expect(error.message).toContain("Invalid request-signature.");
  });


  [
    {
      systemBaseUri: "https://wrong-header.example.com",
      tenantId: "a12be5",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "abcde",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "abcdefg5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "abcdefgBskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "abcd",
      appSecret: "abcdefgBskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRh=",
    },
    {
      systemBaseUri: "https://header.example.com",
      tenantId: "a12be5",
      signature: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=",
      appSecret: "abcd",
    }
  ].forEach(testCase => {
    it(`should throw InvalidRequestSignatureError on: ${JSON.stringify(testCase)})`, () => {

      let error: InvalidRequestSignatureError;
      try {
        validateRequestSignature(testCase.appSecret, testCase.systemBaseUri, testCase.tenantId, testCase.signature);
      } catch (e) {
        error = e;
      }

      expect(error instanceof InvalidRequestSignatureError).toBeTruthy();
      expect(error.message).toContain("Invalid request-signature.");
    });

    it(`should throw InvalidRequestSignatureError on: ${JSON.stringify(testCase)})`, () => {

      let error: InvalidRequestSignatureError;
      try {
        validateDvelopContext(testCase.appSecret, { systemBaseUri: testCase.systemBaseUri, tenantId: testCase.tenantId, requestSignature: testCase.signature });
      } catch (e) {
        error = e;
      }

      expect(error instanceof InvalidRequestSignatureError).toBeTruthy();
      expect(error.message).toContain("Invalid request-signature.");
    });
  });
});