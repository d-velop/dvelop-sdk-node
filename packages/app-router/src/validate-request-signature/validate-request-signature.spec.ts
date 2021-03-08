import { validateRequestSignature } from "./validate-request-signature";

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
    it(`should return true on: ${JSON.stringify(testCase)})`, () => {
      expect(validateRequestSignature(testCase.appSecret, testCase.systemBaseUri, testCase.tenantId, testCase.signature)).toBeTruthy();
    });
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
    it(`should return false on: ${JSON.stringify(testCase)})`, () => {
      expect(validateRequestSignature(testCase.appSecret, testCase.systemBaseUri, testCase.tenantId, testCase.signature)).toBeFalsy();
    });
  });
});