import { logger, logWriter, resetLogging, setLogWriter } from "./logger";
import { Writable } from "stream";
import { DvelopContext } from "@dvelop-sdk/core";
import { globalLoggingContext } from "./context";
import { DbRequest, HttpResponse, IncomingHttpRequest, OutgoingHttpRequest } from "../types/public";

describe("otel logger", () => {
  beforeEach(() => {
    resetLogging();
  });

  test("should have default logger", () => {
    expect(logger).toBeDefined();
  });

  test("should write to output stream", () => {return new Promise<void>(done => {
    const writable = new Writable({
      write: function (_chunk, _encoding, _next) {
        expect(_chunk).toBeDefined();
        done();
      }
    });

    setLogWriter(writable);
    logger.info("Hello, world!");
  });});

  test("should write to output function", () => {return new Promise<void>(done => {
    const writable = (msg: string) => {
      expect(msg).toBeDefined();
      done();
    };

    setLogWriter(writable);
    logger.info("Hello, world!");
  });});

  describe("severity-function", () => {
    describe.each([
      {func: "debug", severity: 5},
      {func: "info", severity: 9},
      {func: "warn", severity: 13},
      {func: "error", severity: 17},
    ])("$func()", ({func, severity}) => {

      test("should log valid JSON", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          expect(() => JSON.parse(msg)).not.toThrowError();
          done();
        };

        setLogWriter(writable);
        logger[func]("Hello, world!");
      });});

      test("should set time as ISO string", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          const isoDateRegex = new RegExp("^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-][01]\\d:[0-5]\\d)$");
          expect(isoDateRegex.test(json.time)).toBeTruthy();
          done();
        };

        setLogWriter(writable);
        logger[func]("Hello, world!");
      });});

      test(`should log severity ${severity}`, () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.sev).toBe(severity);
          done();
        };

        setLogWriter(writable);
        logger[func]("Hello, world!");
      });});

      test("should log string body as is", () => {return new Promise<void>(done => {
        const body = "some body is here";

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.body).toEqual(body);
          done();
        };

        setLogWriter(writable);
        logger[func](body);
      });});

      test("should log object body as is", () => {return new Promise<void>(done => {
        const body = {
          some: "body",
          is: "here"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.body).toEqual(body);
          done();
        };

        setLogWriter(writable);
        logger[func](body);
      });});

    });

    describe("exception()", () => {
      test("should log valid JSON", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          expect(() => JSON.parse(msg)).not.toThrowError();
          done();
        };

        setLogWriter(writable);
        logger.exception(new Error("something"));
      });});

      test("should set time as ISO string", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          const isoDateRegex = new RegExp("^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|[+-][01]\\d:[0-5]\\d)$");
          expect(isoDateRegex.test(json.time)).toBeTruthy();
          done();
        };

        setLogWriter(writable);
        logger.exception(new Error("something"));
      });});

      test("should log severity 17", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.sev).toBe(17);
          done();
        };

        setLogWriter(writable);
        logger.exception(new Error("something"));
      });});

      test("should log error name and message as body", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.body).toEqual("Error: some error");
          done();
        };

        setLogWriter(writable);
        logger.exception(new Error("some error"));
      });});

      test("should log error as attribute", () => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.exception).toBeDefined();
          expect(json.attr.exception.type).toEqual("Error");
          expect(json.attr.exception.message).toEqual("some error");
          expect(json.attr.exception.stacktrace).toBeDefined();
          done();
        };

        setLogWriter(writable);
        logger.exception(new Error("some error"));
      });});
    });
  });

  describe("with-function", () => {

    test("withCtx() should set context properties", () => {return new Promise<void>(done => {
      const context: DvelopContext = {
        tenantId: "tnId",
        traceId: "trcId",
        spanId: "spnId"
      };

      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.tn).toEqual(context.tenantId);
        expect(json.trace).toEqual(context.traceId);
        expect(json.span).toEqual(context.spanId);
        done();
      };

      setLogWriter(writable);
      logger.withCtx(context).info("Hello, world!");
    });});

    test("withName() should set name property", () => {return new Promise<void>(done => {
      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.name).toEqual("some name");
        done();
      };

      setLogWriter(writable);
      logger.withName("some name").info("Hello, world!");
    });});

    test("withInvisibility() should set bis property", () => {return new Promise<void>(done => {
      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.vis).toEqual(0);
        done();
      };

      setLogWriter(writable);
      logger.withInvisibility().info("Hello, world!");
    });});

    describe("withHttpRequest()", () => {
      test("should set incoming http attributes", () => {return new Promise<void>(done => {
        const request: IncomingHttpRequest = {
          headers: {userAgent: "something/1.2 (some other)"},
          method: "GET",
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          clientIp: "127.0.0.1"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
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

        setLogWriter(writable);
        logger.withHttpRequest(request).info("Hello, world!");
      });});

      test("should set outgoing http attributes", () => {return new Promise<void>(done => {
        const request: OutgoingHttpRequest = {
          method: "GET",
          url: "https://www.example.org/some/path?and=query#fragment",
          headers: {
            userAgent: "custom/1.0 (agent)"
          }
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
          expect(json.attr.http.method).toEqual("GET");
          expect(json.attr.http.statusCode).toBeUndefined();
          expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
          expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
          expect(json.attr.http.host).toEqual("www.example.org");
          expect(json.attr.http.scheme).toEqual("https");
          expect(json.attr.http.route).toBeUndefined();
          expect(json.attr.http.userAgent).toEqual("custom/1.0 (agent)");
          expect(json.attr.http.clientIp).toBeUndefined();
          expect(json.attr.http.server?.duration).toBeUndefined();
          expect(json.attr.http.client?.duration).toBeUndefined();
          done();
        };

        setLogWriter(writable);
        logger.withHttpRequest(request).info("Hello, world!");
      });});

      test("should not set user agent when missing", () => {return new Promise<void>(done => {
        const request: IncomingHttpRequest = {
          method: "GET",
          url: "https://www.example.org/some/path?and=query#fragment",
          routeTemplate: "/some/:id",
          clientIp: "127.0.0.1"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
          expect(json.attr.http.userAgent).toBeUndefined();
          done();
        };

        setLogWriter(writable);
        logger.withHttpRequest(request).info("Hello, world!");
      });});

      test("should set method as upper case", () => {return new Promise<void>(done => {
        const request: IncomingHttpRequest = {
          method: "get",
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
          expect(json.attr.http.method).toEqual("GET");
          done();
        };

        setLogWriter(writable);
        logger.withHttpRequest(request).info("Hello, world!");
      });});

    });

    describe("withHttpResponse()", () => {
      test("should set http attributes", () => {return new Promise<void>(done => {
        const response: HttpResponse = {
          clientDuration: 17,
          serverDuration: 32,
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
          expect(json.attr.http.method).toBeUndefined();
          expect(json.attr.http.statusCode).toEqual(203);
          expect(json.attr.http.url).toEqual("https://www.example.org/some/path?and=query#fragment");
          expect(json.attr.http.target).toEqual("/some/path?and=query#fragment");
          expect(json.attr.http.host).toEqual("www.example.org");
          expect(json.attr.http.scheme).toEqual("https");
          expect(json.attr.http.route).toBeUndefined();
          expect(json.attr.http.userAgent).toBeUndefined();
          expect(json.attr.http.clientIp).toBeUndefined();
          expect(json.attr.http.server?.duration).toEqual(32);
          expect(json.attr.http.client?.duration).toEqual(17);
          done();
        };

        setLogWriter(writable);
        logger.withHttpResponse(response).info("Hello, world!");
      });});

      test("should set http attributes without duration", () => {return new Promise<void>(done => {
        const response: HttpResponse = {
          statusCode: 203,
          url: "https://www.example.org/some/path?and=query#fragment"
        };

        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.http).toBeDefined();
          expect(json.attr.http.server?.duration).toBeUndefined();
          expect(json.attr.http.client?.duration).toBeUndefined();
          done();
        };

        setLogWriter(writable);
        logger.withHttpResponse(response).info("Hello, world!");
      });});
    });

    test("withDatabaseRequest() should set db attributes", () => {return new Promise<void>(done => {
      const dbRequest: DbRequest = {
        name: "requestName",
        statement: "SELECT * FROM everything",
        operation: "SELECT",
        duration: 42
      };

      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.attr).toBeDefined();
        expect(json.attr.db).toBeDefined();
        expect(json.attr.db.name).toEqual("requestName");
        expect(json.attr.db.statement).toEqual("SELECT * FROM everything");
        expect(json.attr.db.operation).toEqual("SELECT");
        expect(json.attr.db.duration).toEqual(42);
        done();
      };

      setLogWriter(writable);
      logger.withDatabaseRequest(dbRequest).info("Hello, world!");
    });});

    describe("withAttributes()", () => {
      test.each([
        {type: "object", value: {some: "object"}},
        {type: "array", value: ["some", "array"]},
        {type: "string", value: "someString"},
        {type: "number", value: 42},
        {type: "boolean", value: true},
        {type: "null", value: null},
      ])("should set $type attribute as is", ({value}) => {return new Promise<void>(done => {
        const writable = (msg: string) => {
          const json = JSON.parse(msg);
          expect(json.attr).toBeDefined();
          expect(json.attr.someKey).toBeDefined();
          expect(json.attr.someKey).toEqual(value);
          done();
        };

        setLogWriter(writable);
        logger.withAttributes("someKey", value).info("Hello, world!");
      });});
    });

    test("withException() should set exception attributes", () => {return new Promise<void>(done => {
      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.attr).toBeDefined();
        expect(json.attr.exception).toBeDefined();
        expect(json.attr.exception.type).toEqual("Error");
        expect(json.attr.exception.message).toEqual("some error");
        expect(json.attr.exception.stacktrace).toBeDefined();
        done();
      };

      setLogWriter(writable);
      logger.withException(new Error("some error")).info("Hello, world!");
    });});

  });

  test("should reset everything on resetLogging()", () => {
    setLogWriter((_msg: string) => {});
    globalLoggingContext.setServiceInformation("someName", "someVersion", "someInstanceId");

    resetLogging();

    expect(globalLoggingContext.serviceInformation).toBeUndefined();
    expect(logWriter()).toEqual(process.stdout);
  });

  describe("global logging context", () => {
    test("should be used", () => {return new Promise<void>(done => {
      const writable = (msg: string) => {
        const json = JSON.parse(msg);
        expect(json.res).toBeDefined();
        expect(json.res.svc).toBeDefined();
        expect(json.res.svc.name).toEqual("someName");
        expect(json.res.svc.ver).toEqual("someVersion");
        expect(json.res.svc.inst).toEqual("someInstanceId");
        done();
      };

      setLogWriter(writable);

      globalLoggingContext.setServiceInformation("someName", "someVersion", "someInstanceId");
      logger.info("Hello, world!");
    });});
  });

});
