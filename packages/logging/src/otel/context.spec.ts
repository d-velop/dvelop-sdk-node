import { resetLogging } from "./logger";
import { globalLoggingContext } from "./context";

describe("otel logger context", () => {
  beforeEach(() => {
    resetLogging();
  });

  test("should set information", () => {
    globalLoggingContext.setServiceInformation("someName", "someVersion", "someInstId");
    expect(globalLoggingContext.serviceInformation).toEqual({appName: "someName", appVersion: "someVersion", instanceId: "someInstId"});
  });

  test("should reset information", () => {
    globalLoggingContext.setServiceInformation("someName", "someVersion", "someInstId");
    globalLoggingContext.setServiceInformation("", undefined, undefined);
    expect(globalLoggingContext.serviceInformation).toBeUndefined();
  });
});
