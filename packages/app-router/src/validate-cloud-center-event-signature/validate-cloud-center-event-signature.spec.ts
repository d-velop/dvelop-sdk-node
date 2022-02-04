import { InvalidCloudCenterEventSignatureError, validateCloudCenterEventSignature } from "./validate-cloud-center-event-signature";

describe("validateCloudCenterEventSignature", () => {

  [
    {
      appSecret: "Rg9iJXX0Jkun9u4Rp6no8HTNEdHlfX9aZYbFJ9b6YdQ=",
      httpMethod: "POST",
      resourcePath: "/myapp/dvelop-cloud-lifecycle-event",
      queryString: "",
      headers: {
        "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
        "x-dv-signature-headers": "x-dv-signature-algorithm,x-dv-signature-headers,x-dv-signature-timestamp",
        "x-dv-signature-timestamp": "2019-08-09T08:49:42Z"
      },
      payload: {
        type: "subscribe",
        tenantId: "id",
        baseUri: "https://someone.d-velop.cloud"
      },
      cloudCenterEventSignature: "02783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
    }
  ].forEach(testCase => {

    it("should calculate validate signature", () => {
      expect(() => validateCloudCenterEventSignature(testCase.appSecret, testCase.httpMethod, testCase.resourcePath, testCase.queryString, testCase.headers, testCase.payload, testCase.cloudCenterEventSignature)).not.toThrowError();
    });
  });


  [
    {
      appSecret: "Rg9iJXX0Jkun9u4Rp6no8HTNEdHlfX9aZYbFJ9b6YdQ=",
      httpMethod: "GET",
      resourcePath: "/myapp/dvelop-cloud-lifecycle-event",
      queryString: "",
      headers: {
        "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
        "x-dv-signature-headers": "x-dv-signature-algorithm,x-dv-signature-headers,x-dv-signature-timestamp",
        "x-dv-signature-timestamp": "2019-08-09T08:49:42Z"
      },
      payload: {
        type: "subscribe",
        tenantId: "id",
        baseUri: "https://someone.d-velop.cloud"
      },
      cloudCenterEventSignature: "02783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
    },
    {
      appSecret: "Rg9iJXX0Jkun9u4Rp6no8HTNEdHlfX9aZYbFJ9b6YdQ=",
      httpMethod: "POST",
      resourcePath: "/myapp/dvelop-cloud-lifecycle-event",
      queryString: "",
      headers: {
        "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
        "x-dv-signature-headers": "x-dv-signature-algorithm,x-dv-signature-headers,x-dv-signature-timestamp",
        "x-dv-signature-timestamp": "2019-08-09T08:49:42Z"
      },
      payload: {
        type: "subscribe",
        tenantId: "id",
        baseUri: "https://someone.d-velop.cloud"
      },
      cloudCenterEventSignature: "4202783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
    },
    {
      appSecret: "Rg9iJXX0Jkun9u4Rp6no8HTNEdHlfX9aZYbFJ9b6YdQ=",
      httpMethod: "POST",
      resourcePath: "/myapp/dvelop-cloud-lifecycle-event",
      queryString: "",
      headers: {
        "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
        "x-dv-signature-timestamp": "2019-08-09T08:49:42Z"
      },
      payload: {
        type: "subscribe",
        tenantId: "id",
        baseUri: "https://someone.d-velop.cloud"
      },
      cloudCenterEventSignature: "4202783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
    },
    {
      appSecret: "Rg9iJXX0Jkun9u4Rp6no8HTNEdHlfX9aZYbFJ9b6YdQ=",
      httpMethod: "POST",
      resourcePath: "/myapp/dvelop-cloud-lifecycle-event",
      queryString: "",
      headers: {
        "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
        "x-dv-signature-headers": "x-dv-signature-algorithm,x-dv-signature-headers,x-dv-signature-timestamp"
      },
      payload: {
        type: "subscribe",
        tenantId: "id",
        baseUri: "https://someone.d-velop.cloud"
      },
      cloudCenterEventSignature: "4202783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
    }
  ].forEach(testCase => {

    it("should throe InvalidCloudCenterEventSignatureError", () => {

      let error: InvalidCloudCenterEventSignatureError;
      try {
        validateCloudCenterEventSignature(testCase.appSecret, testCase.httpMethod, testCase.resourcePath, testCase.queryString, testCase.headers, testCase.payload, testCase.cloudCenterEventSignature);
      } catch (e) {
        error = e;
      }

      expect(error instanceof InvalidCloudCenterEventSignatureError).toBeTruthy();
      expect(error.message).toContain("Invalid CloudCenterEvent-signature: A cloud center event was recieved but signature was invalid.");
    });
  });
});