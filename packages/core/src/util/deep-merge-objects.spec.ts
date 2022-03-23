import { DeepMergeError, deepMergeObjects } from "./deep-merge-objects";

describe("deepMergeObjects", () => {

  [
    {
      objects: [
        { a: "1" },
        { a: "1" }
      ],
      expected: { a: "1" }
    }, {
      objects: [
        { a: "1" },
        { a: "2" }
      ],
      expected: { a: "2" }
    }, {
      objects: [
        { a: "1", b: "3" },
        { a: "2", b: "4" }
      ],
      expected: { a: "2", b: "4" }
    }, {
      objects: [
        { a: "1", b: "3" },
        { a: "2", c: "4" }
      ],
      expected: { a: "2", b: "3", c: "4" }
    }, {
      objects: [
        { a: { b: "1", c: "3" } },
        { a: { b: "4", d: "5" } }
      ],
      expected: { a: { b: "4", c: "3", d: "5" } }
    }, {
      objects: [
        { a: { b: "1", c: "3" }, e: "6" },
        { a: { b: "4", d: "5" }, f: "7" }
      ],
      expected: { a: { b: "4", c: "3", d: "5" }, e: "6", f: "7" }
    }, {
      objects: [
        { a: "1" },
        { b: { c: "2" } }
      ],
      expected: { a: "1", b: { c: "2" } }
    }, {
      objects: [
        { a: { b: "1" } },
        { c: "2" }
      ],
      expected: { a: { b: "1" }, c: "2" }
    }, {
      objects: [
        { a: "1" },
        { a: { b: "2" } }
      ],
      expected: { a: { b: "2" } }
    }, {
      objects: [
        { a: { b: "2" } },
        { a: "1" },
      ],
      expected: { a: "1" }
    }, {
      objects: [
        { a: "1", b: "2" },
        { a: "3", c: "4" },
        { a: "5", d: "6" },
      ],
      expected: { a: "5", b: "2", c: "4", d: "6" }
    }, {
      objects: [
        { a: "1", b: "2" },
        { a: "3", c: "4" },
        { b: "5", d: "6" },
      ],
      expected: { a: "3", b: "5", c: "4", d: "6" }
    }
  ].forEach(testCase => {
    it(`should merge objects to ${JSON.stringify(testCase.expected)}`, () => {
      expect(deepMergeObjects(...testCase.objects)).toEqual(testCase.expected);
    });
  });

  [
    ["1"],
    ["1", { b: "2" }, { c: "3" }],
    [{ a: "1" }, { b: "2" }, "3"],
    [1],
    [1, { b: "2" }, { c: "3" }],
    [{ a: "1" }, { b: "2" }, 3],
  ].forEach(testCase => {
    it("should throw DeepMergeError on primitive datatypes", () => {
      let expectedError: DeepMergeError;
      try {
        deepMergeObjects(...testCase);
      } catch (e: any) {
        expectedError = e;
      }
      expect(expectedError instanceof DeepMergeError).toBeTruthy();
      expect(expectedError.message).toContain("deepMergeObjects-function can only accept objects.");
    });
  });

  [
    [],
    [{ a: "1" }]
  ].forEach(testCase => {
    it("should throw DeepMergeError on less than 2 arguments", () => {
      let expectedError: DeepMergeError;
      try {
        deepMergeObjects(...testCase);
      } catch (e: any) {
        expectedError = e;
      }
      expect(expectedError instanceof DeepMergeError).toBeTruthy();
      expect(expectedError.message).toContain("Must supply at least two objects to deepMergeObjects-function.");
    });
  });
});