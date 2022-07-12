import { LoggingError } from "../../error";
import { fileTransportFactory } from "./file-transport";

describe("fileTransportFactory", () => {


  let _createWriteStream = jest.fn();
  let write = jest.fn();

  const path: string = "HiItsMePath";

  beforeEach(() => {

    jest.resetAllMocks();

    _createWriteStream.mockReturnValue({
      write
    });

  });

  describe("on success", () => {

    beforeEach(() => {
      write.mockImplementation((_: any, cb: Function) => (cb()));
    });

    [
      undefined, true, 4, "string"
    ].forEach(testCase => {

      it(`should write ${testCase}`, async () => {

        const fileTransport = fileTransportFactory(path, _createWriteStream);
        await fileTransport(testCase);

        expect(_createWriteStream).toHaveBeenCalledTimes(1);
        expect(_createWriteStream).toHaveBeenCalledWith(path, { flags: "a" });

        expect(write).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenLastCalledWith(`\n${testCase}`, expect.any(Function));
      });
    });


    [
      null, {}, { a: "a" }, { a: "a", b: { c: "c" } }, [], [1, 2], ["hi", "ho"], [{ a: "a" }, { a: "a", b: { c: "c" } }]
    ].forEach(testCase => {
      it(`should write object: ${JSON.stringify(testCase)} as string `, async () => {

        const fileTransport = fileTransportFactory(path, _createWriteStream);
        await fileTransport(testCase);

        expect(_createWriteStream).toHaveBeenCalledTimes(1);
        expect(_createWriteStream).toHaveBeenCalledWith(path, { flags: "a" });

        expect(write).toHaveBeenCalledTimes(1);
        expect(write).toHaveBeenLastCalledWith(`\n${JSON.stringify(testCase)}`, expect.any(Function));
      });
    });
  });

  describe("on error", () => {

    it("should throw LoggingError on createWriteStream-error", async () => {

      const err: Error = new Error("HiItsMeError");
      _createWriteStream.mockImplementation((_: any, __: Function) => { throw err; });

      let expectedError;
      try {
        const fileTransport = fileTransportFactory(path, _createWriteStream);
        await fileTransport("HiItsMeStatement");
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof LoggingError).toBeTruthy();
      expect(expectedError.message).toContain(err.message);
      expect(expectedError.message).toContain("Failed to write event to file:");
      expect(expectedError.originalError).toBe(err);
    });

    it("should throw LoggingError on write-error", async () => {

      const err: Error = new Error("HiItsMeError");
      write.mockImplementation((_: any, __: Function) => { throw err; });

      let expectedError;
      try {
        const fileTransport = fileTransportFactory(path, _createWriteStream);
        await fileTransport("HiItsMeStatement");
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof LoggingError).toBeTruthy();
      expect(expectedError.message).toContain(err.message);
      expect(expectedError.message).toContain("Failed to write event to file:");
      expect(expectedError.originalError).toBe(err);
    });
  });
});