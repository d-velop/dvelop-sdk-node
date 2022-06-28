import { OtelProviderError, otelProviderFactory } from "./otelProvider";
import { DvelopLogEvent, DbRequest, HttpResponse, IncomingHttpRequest, OutgoingHttpRequest, DvelopLogLevel } from "../logger/log-event";
import { OtelEvent, OtelSeverity } from "./internal-types";
import { DvelopContext, TraceContext } from "@dvelop-sdk/core";

describe("otel provider", () => {

  test("should return provider", () => {
    const provider = otelProviderFactory({ appName: "test", transports: [() => new Promise(() => { })] });

    expect(provider).toBeDefined();
    expect(typeof provider).toEqual("function");
  });

  test("should write to transport", () => {
    return new Promise<void>(done => {

      const provider = otelProviderFactory({
        appName: "test", transports: [async (otelMessage) => {
          expect(otelMessage).toBeDefined();
          done();
        }]
      });

      provider({}, {}, "debug");
    });
  });

  test("should throw error on empty transports", () => {

    let expectedError: OtelProviderError;
    try {
      otelProviderFactory({ appName: "appName", transports: [] });
    } catch (e: any) {
      expectedError = e;
    }

    expect(expectedError).not.toBeUndefined();
    expect(expectedError instanceof OtelProviderError).toBeTruthy();
    expect(expectedError.message).toEqual("OtelLogginProvider failed to initialize: No transports.");
  });

  test("should return valid json", () => {
    return new Promise<void>(done => {
      const provider = otelProviderFactory({
        appName: "test", transports: [async (otelMessage) => {
          expect(() => JSON.parse(otelMessage)).not.toThrowError();
          done();
        }]
      });

      provider({}, {}, "debug");
    });
  });

  test("should set time as ISO string", () => {
    return new Promise<void>(done => {
      const provider = otelProviderFactory({
        appName: "test", transports: [async otelMessage => {
          const json: OtelEvent = JSON.parse(otelMessage);
          const isoDateRegex = new RegExp("^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-][01]\\d:[0-5]\\d)$");
          expect(isoDateRegex.test(json.time)).toBeTruthy();
          done();
        }]
      });

      provider({}, {}, "debug");
    });
  });

  test("should log string body as is", () => {
    return new Promise<void>(done => {
      const body = "some body is here";

      const provider = otelProviderFactory({
        appName: "test", transports: [async otelMessage => {
          const json: OtelEvent = JSON.parse(otelMessage);
          expect(json.body).toEqual(body);
          done();
        }]
      });

      provider({}, { message: body }, "debug");
    });
  });

  test("should log object body as is", () => {
    return new Promise<void>(done => {
      const body = {
        some: "body",
        is: "here"
      };

      const provider = otelProviderFactory({
        appName: "test", transports: [async otelMessage => {
          const json: OtelEvent = JSON.parse(otelMessage);
          expect(json.body).toEqual(body);
          done();
        }]
      });

      provider({}, { message: body }, "debug");
    });
  });

  describe("should log severity", () => {
    test.each([
      { level: "debug", otelSeverity: OtelSeverity.DEBUG1 },
      { level: "info", otelSeverity: OtelSeverity.INFO1 },
      // { level: "warn", otelSeverity: OtelSeverity.WARN1 },
      { level: "error", otelSeverity: OtelSeverity.ERROR1 },
      { level: undefined, otelSeverity: 0 }
    ])("Severity.$otelSeverity", ({ level, otelSeverity }) => {
      return new Promise<void>(done => {

        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.sev).toBe(otelSeverity);
            done();
          }]
        });

        provider({}, {}, level as DvelopLogLevel);
      });
    });
  });

  test("should set providerOptions", () => {
    return new Promise<void>(done => {
      const provider = otelProviderFactory({
        appName: "someAppName", appVersion: "someAppVersion", instanceId: "someInstanceId", transports: [
          async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.res?.svc).toBeDefined();
            expect(json.res.svc.name).toEqual("someAppName");
            expect(json.res.svc.ver).toEqual("someAppVersion");
            expect(json.res.svc.inst).toEqual("someInstanceId");
            done();
          }
        ]
      });

      provider({}, {}, "debug");
    });
  });

  test("should set DvelopContext properties", () => {
    return new Promise<void>(done => {

      const provider = otelProviderFactory({
        appName: "test", transports: [async otelMessage => {
          const json: OtelEvent = JSON.parse(otelMessage);
          expect(json.tn).toEqual("someTenantId");
          expect(json.span).toEqual("someSpanId");
          expect(json.trace).toEqual("someTraceId");
          done();
        }]
      });

      const dvelopContext: DvelopContext = {
        tenantId: "someTenantId",
        traceContext: { traceId: "someTraceId", spanId: "someSpanId" } as TraceContext
      };

      provider(dvelopContext, {}, "debug");
    });
  });

  describe("LogOptions", () => {
    test("should set event name", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.name).toEqual("someName");
            done();
          }]
        });

        const event: DvelopLogEvent = {
          name: "someName"
        };

        provider({}, event, "debug");
      });
    });

    test("should set visible to 1 if invisibility is not set", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.vis).toBe(1);
            done();
          }]
        });

        const event: DvelopLogEvent = {};

        provider({}, event, "debug");
      });
    });

    test("should set visible to 1 if invisible is false", () => {
      return new Promise<void>(done => {

        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.vis).toBe(1);
            done();
          }]
        });

        const event: DvelopLogEvent = {
          invisible: false
        };


        provider({}, event, "debug");
      });
    });

    test("should set visible to 0 if invisible is true", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.vis).toBe(0);
            done();
          }]
        });

        const options: DvelopLogEvent = {
          invisible: true
        };

        provider({}, options, "debug");
      });
    });

    describe("incoming http request", () => {
      test("should set all attributes", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.method).toEqual("GET");
              expect(json.attr.http.statusCode).toBeUndefined();
              expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
              expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
              expect(json.attr.http.host).toEqual("www.example.org");
              expect(json.attr.http.scheme).toEqual("https");
              expect(json.attr.http.route).toEqual("/some/:id");
              expect(json.attr.http.userAgent).toEqual("something/1.2 (some other)");
              expect(json.attr.http.clientIp).toEqual("127.0.0.1");
              expect(json.attr.http.client?.duration).toBeUndefined();
              expect(json.attr.http.server?.duration).toBeUndefined();
              done();
            }]
          });

          const request: IncomingHttpRequest = {
            headers: { userAgent: "something/1.2 (some other)" },
            method: "get",
            url: "https://www.example.org/some/path?and=query#fragment",
            routeTemplate: "/some/:id",
            clientIp: "127.0.0.1"
          };

          const event: DvelopLogEvent = {
            httpIncomingRequest: request
          };

          provider({}, event, "debug");
        });
      });

      test("should not set user agent if not set", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.userAgent).not.toBeDefined();
              done();
            }]
          });

          const request: IncomingHttpRequest = {
            method: "get",
            url: "https://www.example.org/some/path?and=query#fragment",
            routeTemplate: "/some/:id",
            clientIp: "127.0.0.1"
          };

          const event: DvelopLogEvent = {
            httpIncomingRequest: request
          };

          provider({}, event, "debug");
        });
      });
    });

    describe("incoming http response", () => {
      test("should set all attributes", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.method).toEqual("GET");
              expect(json.attr.http.statusCode).toBe(203);
              expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
              expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
              expect(json.attr.http.host).toEqual("www.example.org");
              expect(json.attr.http.scheme).toEqual("https");
              expect(json.attr.http.route).toEqual("/some/:id");
              expect(json.attr.http.userAgent).toBeUndefined();
              expect(json.attr.http.clientIp).toBeUndefined();
              expect(json.attr.http.client?.duration).toBeUndefined();
              expect(json.attr.http.server?.duration).toBe(43);
              done();
            }]
          });

          const response: HttpResponse = {
            method: "get",
            statusCode: 203,
            url: "https://www.example.org/some/path?and=query#fragment",
            routeTemplate: "/some/:id",
            serverDuration: 43,
            clientDuration: 42
          };

          const event: DvelopLogEvent = {
            httpIncomingResponse: response
          };

          provider({}, event, "debug");
        });
      });

      test("should not set duration if not specified", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.client).toBeUndefined();
              expect(json.attr.http.server).toBeUndefined();
              done();
            }]
          });

          const response: HttpResponse = {
            method: "get",
            statusCode: 203,
            url: "https://www.example.org/some/path?and=query#fragment",
            routeTemplate: "/some/:id"
          };

          const event: DvelopLogEvent = {
            httpIncomingResponse: response
          };

          provider({}, event, "debug");
        });
      });
    });

    describe("outgoing http request", () => {
      test("should set all attributes", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.method).toEqual("GET");
              expect(json.attr.http.statusCode).toBeUndefined();
              expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
              expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
              expect(json.attr.http.host).toEqual("www.example.org");
              expect(json.attr.http.scheme).toEqual("https");
              expect(json.attr.http.route).toBeUndefined();
              expect(json.attr.http.userAgent).toEqual("something/1.2 (some other)");
              expect(json.attr.http.clientIp).toBeUndefined();
              expect(json.attr.http.client?.duration).toBeUndefined();
              expect(json.attr.http.server?.duration).toBeUndefined();
              done();
            }]
          });

          const request: OutgoingHttpRequest = {
            headers: { userAgent: "something/1.2 (some other)" },
            method: "get",
            url: "https://www.example.org/some/path?and=query#fragment"
          };

          const event: DvelopLogEvent = {
            httpOutgoingRequest: request
          };

          provider({}, event, "debug");
        });
      });

      test("should not set user agent if not set", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.userAgent).not.toBeDefined();
              done();
            }]
          });

          const request: OutgoingHttpRequest = {
            method: "get",
            url: "https://www.example.org/some/path?and=query#fragment"
          };

          const options: DvelopLogEvent = {
            httpOutgoingRequest: request
          };

          provider({}, options, "debug");
        });
      });
    });

    describe("outgoing http response", () => {
      test("should set all attributes", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.method).toEqual("GET");
              expect(json.attr.http.statusCode).toBe(203);
              expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
              expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
              expect(json.attr.http.host).toEqual("www.example.org");
              expect(json.attr.http.scheme).toEqual("https");
              expect(json.attr.http.route).toBeUndefined();
              expect(json.attr.http.userAgent).toBeUndefined();
              expect(json.attr.http.clientIp).toBeUndefined();
              expect(json.attr.http.client?.duration).toBe(42);
              expect(json.attr.http.server?.duration).toBeUndefined();
              done();
            }]
          });

          const response: HttpResponse = {
            method: "get",
            statusCode: 203,
            url: "https://www.example.org/some/path?and=query#fragment",
            routeTemplate: "/some/:id",
            serverDuration: 43,
            clientDuration: 42
          };

          const event: DvelopLogEvent = {
            httpOutgoingResponse: response
          };

          provider({}, event, "debug");
        });
      });

      test("should not set duration if not specified", () => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr?.http).toBeDefined();
              expect(json.attr.http.client).toBeUndefined();
              expect(json.attr.http.server).toBeUndefined();
              done();
            }]
          });

          const response: HttpResponse = {
            method: "get",
            statusCode: 203,
            url: "https://www.example.org/some/path?and=query#fragment"
          };

          const event: DvelopLogEvent = {
            httpOutgoingResponse: response
          };

          provider({}, event, "debug");
        });
      });
    });

    test("should not set other attributes if only http specified", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.attr.http).toBeDefined();
            expect(Object.entries(json.attr).length).toBe(1);
            done();
          }]
        });

        const event: DvelopLogEvent = {
          httpIncomingRequest: { method: "", url: "https://google.de" },
          httpIncomingResponse: { method: "", url: "https://google.de", statusCode: 200 },
          httpOutgoingRequest: { method: "", url: "https://google.de" },
          httpOutgoingResponse: { method: "", url: "https://google.de", statusCode: 200 },
        };

        provider({}, event, "debug");
      });
    });

    test("should set db attribute", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.attr).toBeDefined();
            expect(json.attr.db).toBeDefined();
            expect(json.attr.db.name).toEqual("requestName");
            expect(json.attr.db.statement).toEqual("SELECT * FROM everything");
            expect(json.attr.db.operation).toEqual("SELECT");
            expect(json.attr.db.duration).toEqual(42);
            done();
          }]
        });

        const dbRequest: DbRequest = {
          name: "requestName",
          statement: "SELECT * FROM everything",
          operation: "SELECT",
          duration: 42
        };

        const event: DvelopLogEvent = {
          dbRequest: dbRequest
        };

        provider({}, event, "debug");
      });
    });

    describe("should set custom attributes", () => {
      test.each([
        { type: "object", value: { some: "object" } },
        { type: "array", value: ["some", "array"] },
        { type: "string", value: "someString" },
        { type: "number", value: 42 },
        { type: "boolean", value: true },
        { type: "null", value: null },
      ])("with type $type", ({ value }) => {
        return new Promise<void>(done => {
          const provider = otelProviderFactory({
            appName: "test", transports: [async otelMessage => {
              const json: OtelEvent = JSON.parse(otelMessage);
              expect(json.attr).toBeDefined();
              expect(json.attr.someKey).toBeDefined();
              expect(json.attr.someKey).toEqual(value);
              done();
            }]
          });

          const event: DvelopLogEvent = {
            customAttributes: {
              someKey: value
            }
          };

          provider({}, event, "debug");
        });
      });
    });

    test("should set exception attribute", () => {
      return new Promise<void>(done => {
        const provider = otelProviderFactory({
          appName: "test", transports: [async otelMessage => {
            const json: OtelEvent = JSON.parse(otelMessage);
            expect(json.attr).toBeDefined();
            expect(json.attr.exception).toBeDefined();
            expect(json.attr.exception.type).toEqual("Error");
            expect(json.attr.exception.message).toEqual("some error");
            expect(json.attr.exception.stacktrace).toBeDefined();
            done();
          }]
        });

        const event: DvelopLogEvent = {
          error: new Error("some error")
        };

        provider({}, event, "debug");
      });
    });

  });

});
