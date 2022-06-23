import { DvelopLogger } from "./logger";
import { DvelopLogEvent, ProviderFn, Severity } from "./log-event";
import { DvelopContext } from "@dvelop-sdk/core";

describe("DvelopLogger", () => {

  test("should create a new DvelopLogger", () => {
    const logger = new DvelopLogger({ provider: [() => { }] });
    expect(logger).toBeDefined();
  });

  test("should throw error on new DvelopLogger if no provider specified", () => {
    expect(() => new DvelopLogger({ provider: [] })).toThrowError();
  });

  describe("severity function", () => {
    describe.each([
      { func: "debug", severity: Severity.debug },
      { func: "info", severity: Severity.info },
      { func: "warn", severity: Severity.warn },
      { func: "error", severity: Severity.error },
    ])("$func()", ({ func, severity }) => {

      test("should use logging provider", () => {
        return new Promise<void>(done => {
          const logger = new DvelopLogger({
            provider: [(context, severity, options) => {
              expect(context).toBeDefined();
              expect(severity).toBeDefined();
              expect(options).toBeDefined();
              done();
            }]
          });

          logger[func]({}, "");
        });
      });

      test("should use multiple logging providers", () => {
        const provider1: ProviderFn = jest.fn();
        const provider2: ProviderFn = jest.fn();

        const logger = new DvelopLogger({ provider: [provider1, provider2] });

        logger[func]({}, "");

        expect(provider1).toHaveBeenCalled();
        expect(provider2).toHaveBeenCalled();
      });

      test("should set severity", () => {
        return new Promise<void>(done => {
          const logger = new DvelopLogger({
            provider: [(_, logSeverity, __) => {
              expect(logSeverity).toBe(severity);
              done();
            }]
          });

          logger[func]({}, "");
        });
      });

      test("should pass DvelopContext", () => {
        return new Promise<void>(done => {
          const dvelopContext: DvelopContext = {
            tenantId: "someTenant",
            traceContext: {
              version: 0,
              sampled: true,
              traceId: "someTrace",
              spanId: "someSpan"
            }
          };

          const logger = new DvelopLogger({
            provider: [(context, _, __) => {
              expect(context).toEqual(dvelopContext);
              done();
            }]
          });

          logger[func](dvelopContext, "");
        });
      });

      test("should set message in LogOptions", () => {
        return new Promise<void>(done => {
          const logger = new DvelopLogger({
            provider: [(_, __, options) => {
              expect(options.message).toEqual("some message");
              done();
            }]
          });

          logger[func]({}, "some message");
        });
      });

      test("should pass LogOptions as is", () => {
        return new Promise<void>(done => {
          const logOptions: DvelopLogEvent = {
            message: { some: "thing" },
            error: new Error("some error"),
            name: "some name",
            invisible: true,
            customAttributes: {
              hello: "world"
            }
          };

          const logger = new DvelopLogger({
            provider: [(_, __, options) => {
              expect(options).toEqual(logOptions);
              done();
            }]
          });

          logger[func]({}, logOptions);
        });
      });
    });
  });

});

// eslint-disable-next-line jest/no-commented-out-tests
/*
  test("", () => {return new Promise<void>(done => {
    const logger = new DvelopLogger({provider: [(context, severity, options) => {

    }]});
  });});
*/
