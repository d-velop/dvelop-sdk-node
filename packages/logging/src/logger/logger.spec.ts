import { DvelopLogger, ProviderFn } from "./logger";
import { DvelopLogEvent } from "./log-event";
import { DvelopContext } from "@dvelop-sdk/core";

describe("DvelopLogger", () => {

  test("should create a new DvelopLogger", () => {
    const logger = new DvelopLogger({ providers: [async () => { }] });
    expect(logger).toBeDefined();
  });

  test("should throw error on new DvelopLogger if no provider specified", () => {
    expect(() => new DvelopLogger({ providers: [] })).toThrowError();
  });

  describe("severity function", () => {
    describe.each([
      { func: "debug", level: "debug" },
      { func: "info", level: "info" },
      // { func: "warn", level: "warn" },
      { func: "error", level: "error" },
    ])("$func()", ({ func, level }) => {

      test("should use logging provider", async () => {
        let logger: DvelopLogger;
        const provider: ProviderFn = jest.fn();
        return new Promise<void>(done => {
          logger = new DvelopLogger({
            providers: [provider]
          });

          logger[func]({}, {}, "debug");
          expect(provider).toHaveBeenCalledTimes(1);
          expect(provider).toHaveBeenCalledWith({}, {}, level);
          done();
        });
      });

      test("should use multiple logging providers", () => {
        const provider1: ProviderFn = jest.fn();
        const provider2: ProviderFn = jest.fn();

        const logger = new DvelopLogger({ providers: [provider1, provider2] });

        return new Promise<void>(done => {
          logger[func]({}, "");

          expect(provider1).toHaveBeenCalled();
          expect(provider2).toHaveBeenCalled();
          done();
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
            providers: [async (context, _, __) => {
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
            providers: [async (_, event, __) => {
              expect(event.message).toEqual("some message");
              done();
            }]
          });

          logger[func]({}, "some message");
        });
      });

      test("should pass LogOptions as is", () => {
        return new Promise<void>(done => {

          const event: DvelopLogEvent = {
            message: { some: "thing" },
            error: new Error("some error"),
            name: "some name",
            invisible: true,
            customAttributes: {
              hello: "world"
            }
          };

          const logger = new DvelopLogger({
            providers: [async (_, options, __) => {
              expect(options).toEqual(event);
              done();
            }]
          });

          logger[func]({}, event);
        });
      });

      test("should merge with defaults", async () => {

        const mergeFn: (...events: Partial<DvelopLogEvent>[]) => DvelopLogEvent = jest.fn();
        const event: DvelopLogEvent = {
          message: "HiItsMeMessage"
        };
        const defaults: DvelopLogEvent = {
          message: "HiItsMeDefaultMessage"
        };

        const logger = new DvelopLogger({
          providers: [async (_, __, ___) => { }],
          defaults: defaults

        }, mergeFn);

        logger[func]({}, event);
        expect(mergeFn).toHaveBeenCalledTimes(1);
        expect(mergeFn).toHaveBeenCalledWith(defaults, event);
      });
    });


  });


});
