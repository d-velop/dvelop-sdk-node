import { otelProviderFactory, OtelProviderTransport } from "./otelProvider";
import { LogOptions, Severity } from "../logger/types";
import { Event, OtelSeverity } from "./internal-types";
import { DvelopContext } from "@dvelop-sdk/core";
import { DbRequest, HttpResponse, IncomingHttpRequest, OutgoingHttpRequest } from "../logger/types";

describe("otel provider", () => {

  test("should return provider", () => {
    const provider = otelProviderFactory({appName: "test"});

    expect(provider).toBeDefined();
    expect(typeof provider).toEqual("function");
  });

  test("should write to transport", () => {return new Promise<void>(done => {
    const transport: OtelProviderTransport = otelMessage => {
      expect(otelMessage).toBeDefined();
      done();
    };
    const provider = otelProviderFactory({appName: "test"}, [transport]);

    provider({}, Severity.info, {});
  });});

  test("should return valid json", () => {
    return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        expect(() => JSON.parse(otelMessage)).not.toThrowError();
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      provider({}, Severity.info, {});
    });
  });

  test("should set time as ISO string", () => {return new Promise<void>(done => {
    const transport: OtelProviderTransport = otelMessage => {
      const json: Event = JSON.parse(otelMessage);
      const isoDateRegex = new RegExp("^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-][01]\\d:[0-5]\\d)$");
      expect(isoDateRegex.test(json.time)).toBeTruthy();
      done();
    };
    const provider = otelProviderFactory({appName: "test"}, [transport]);

    provider({}, Severity.info, {});
  });});

  test("should log string body as is", () => {return new Promise<void>(done => {
    const body = "some body is here";

    const transport: OtelProviderTransport = otelMessage => {
      const json: Event = JSON.parse(otelMessage);
      expect(json.body).toEqual(body);
      done();
    };
    const provider = otelProviderFactory({appName: "test"}, [transport]);

    provider({}, Severity.info, {message: body});
  });});

  test("should log object body as is", () => {return new Promise<void>(done => {
    const body = {
      some: "body",
      is: "here"
    };

    const transport: OtelProviderTransport = otelMessage => {
      const json: Event = JSON.parse(otelMessage);
      expect(json.body).toEqual(body);
      done();
    };
    const provider = otelProviderFactory({appName: "test"}, [transport]);

    provider({}, Severity.info, {message: body});
  });});

  describe("should log severity", () => {
    test.each([
      {sev: "debug", severity: Severity.debug, otelSeverity: OtelSeverity.DEBUG1},
      {sev: "info", severity: Severity.info, otelSeverity: OtelSeverity.INFO1},
      {sev: "warn", severity: Severity.warn, otelSeverity: OtelSeverity.WARN1},
      {sev: "error", severity: Severity.error, otelSeverity: OtelSeverity.ERROR1},
    ])("Severity.$sev", ({severity, otelSeverity}) => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.sev).toBe(otelSeverity);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      provider({}, severity, {});
    });});
  });

  test("should set providerOptions", () => {return new Promise<void>(done => {
    const transport: OtelProviderTransport = otelMessage => {
      const json: Event = JSON.parse(otelMessage);
      expect(json.res?.svc).toBeDefined();
      expect(json.res.svc.name).toEqual("someAppName");
      expect(json.res.svc.ver).toEqual("someAppVersion");
      expect(json.res.svc.inst).toEqual("someInstanceId");
      done();
    };
    const provider = otelProviderFactory({appName: "someAppName", appVersion: "someAppVersion", instanceId: "someInstanceId"}, [transport]);

    provider({}, Severity.info, {});
  });});

  test("should set DvelopContext properties", () => {return new Promise<void>(done => {
    const transport: OtelProviderTransport = otelMessage => {
      const json: Event = JSON.parse(otelMessage);
      expect(json.tn).toEqual("someTenantId");
      expect(json.span).toEqual("someSpanId");
      expect(json.trace).toEqual("someTraceId");
      done();
    };
    const provider = otelProviderFactory({appName: "test"}, [transport]);

    const dvelopContext: DvelopContext = {
      tenantId: "someTenantId",
      spanId: "someSpanId",
      traceId: "someTraceId"
    };

    provider(dvelopContext, Severity.info, {});
  });});

  describe("LogOptions", () => {
    test("should set event name", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.name).toEqual("someName");
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {
        name: "someName"
      };

      provider({}, Severity.info, options);
    });});

    test("should set visible to 1 if invisibility is not set", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.vis).toBe(1);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {};

      provider({}, Severity.info, options);
    });});

    test("should set visible to 1 if invisible is false", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.vis).toBe(1);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {
        invisible: false
      };

      provider({}, Severity.info, options);
    });});

    test("should set visible to 0 if invisible is true", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.vis).toBe(0);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {
        invisible: true
      };

      provider({}, Severity.info, options);
    });});

    describe("incoming http request", () => {
      test("should set all attributes", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
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
          expect(json.attr.http.server?.duration).toBeUndefined();
          expect(json.attr.http.client?.duration).toBeUndefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const request: IncomingHttpRequest = {
          headers: {userAgent: "something/1.2 (some other)"},
          method: "get",
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          clientIp: "127.0.0.1"
        };

        const options: LogOptions = {
          httpIncomingRequest: request
        };

        provider({}, Severity.info, options);
      });});

      test("should not set user agent if not set", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
          expect(json.attr?.http).toBeDefined();
          expect(json.attr.http.userAgent).not.toBeDefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const request: IncomingHttpRequest = {
          method: "get",
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          clientIp: "127.0.0.1"
        };

        const options: LogOptions = {
          httpIncomingRequest: request
        };

        provider({}, Severity.info, options);
      });});
    });

    describe("incoming http response", () => {
      test("should set all attributes", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
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
          expect(json.attr.http.server?.duration).toBeUndefined();
          expect(json.attr.http.client?.duration).toBe(42);
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const response: HttpResponse = {
          method: "get",
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          serverDuration: 43,
          clientDuration: 42
        };

        const options: LogOptions = {
          httpIncomingResponse: response
        };

        provider({}, Severity.info, options);
      });});

      test("should not set duration if not specified", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
          expect(json.attr?.http).toBeDefined();
          expect(json.attr.http.client).toBeUndefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const response: HttpResponse = {
          method: "get",
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id"
        };

        const options: LogOptions = {
          httpIncomingResponse: response
        };

        provider({}, Severity.info, options);
      });});
    });

    describe("outgoing http request", () => {
      test("should set all attributes", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
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
          expect(json.attr.http.server?.duration).toBeUndefined();
          expect(json.attr.http.client?.duration).toBeUndefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const request: OutgoingHttpRequest = {
          headers: {userAgent: "something/1.2 (some other)"},
          method: "get",
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const options: LogOptions = {
          httpOutgoingRequest: request
        };

        provider({}, Severity.info, options);
      });});

      test("should not set user agent if not set", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
          expect(json.attr?.http).toBeDefined();
          expect(json.attr.http.userAgent).not.toBeDefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const request: OutgoingHttpRequest = {
          method: "get",
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const options: LogOptions = {
          httpOutgoingRequest: request
        };

        provider({}, Severity.info, options);
      });});
    });

    describe("outgoing http response", () => {
      test("should set all attributes", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
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
          expect(json.attr.http.server?.duration).toBe(43);
          expect(json.attr.http.client?.duration).toBeUndefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const response: HttpResponse = {
          method: "get",
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          serverDuration: 43,
          clientDuration: 42
        };

        const options: LogOptions = {
          httpOutgoingResponse: response
        };

        provider({}, Severity.info, options);
      });});

      test("should not set duration if not specified", () => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
          expect(json.attr?.http).toBeDefined();
          expect(json.attr.http.server).toBeUndefined();
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const response: HttpResponse = {
          method: "get",
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const options: LogOptions = {
          httpOutgoingResponse: response
        };

        provider({}, Severity.info, options);
      });});
    });

    test("should not set other attributes if only http specified", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.attr.http).toBeDefined();
        expect(Object.entries(json.attr).length).toBe(1);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {
        httpIncomingRequest: {method: "", url: "https://google.de"},
        httpIncomingResponse: {method: "", url: "https://google.de", statusCode: 200},
        httpOutgoingRequest: {method: "", url: "https://google.de"},
        httpOutgoingResponse: {method: "", url: "https://google.de", statusCode: 200},
      };

      provider({}, Severity.info, options);
    });});

    test("should set db attribute", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.attr).toBeDefined();
        expect(json.attr.db).toBeDefined();
        expect(json.attr.db.name).toEqual("requestName");
        expect(json.attr.db.statement).toEqual("SELECT * FROM everything");
        expect(json.attr.db.operation).toEqual("SELECT");
        expect(json.attr.db.duration).toEqual(42);
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const dbRequest: DbRequest = {
        name: "requestName",
        statement: "SELECT * FROM everything",
        operation: "SELECT",
        duration: 42
      };

      const options: LogOptions = {
        dbRequest: dbRequest
      };

      provider({}, Severity.info, options);
    });});

    describe("should set custom attributes", () => {
      test.each([
        {type: "object", value: {some: "object"}},
        {type: "array", value: ["some", "array"]},
        {type: "string", value: "someString"},
        {type: "number", value: 42},
        {type: "boolean", value: true},
        {type: "null", value: null},
      ])("with type $type", ({value}) => {return new Promise<void>(done => {
        const transport: OtelProviderTransport = otelMessage => {
          const json: Event = JSON.parse(otelMessage);
          expect(json.attr).toBeDefined();
          expect(json.attr.someKey).toBeDefined();
          expect(json.attr.someKey).toEqual(value);
          done();
        };
        const provider = otelProviderFactory({appName: "test"}, [transport]);

        const options: LogOptions = {
          customAttributes: {
            someKey: value
          }
        };

        provider({}, Severity.info, options);
      });});
    });

    test("should set exception attribute", () => {return new Promise<void>(done => {
      const transport: OtelProviderTransport = otelMessage => {
        const json: Event = JSON.parse(otelMessage);
        expect(json.attr).toBeDefined();
        expect(json.attr.exception).toBeDefined();
        expect(json.attr.exception.type).toEqual("Error");
        expect(json.attr.exception.message).toEqual("some error");
        expect(json.attr.exception.stacktrace).toBeDefined();
        done();
      };
      const provider = otelProviderFactory({appName: "test"}, [transport]);

      const options: LogOptions = {
        error: new Error("some error")
      };

      provider({}, Severity.info, options);
    });});

  });

});
