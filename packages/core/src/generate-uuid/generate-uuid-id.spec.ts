import { generateRequestId, generateUuid } from "./generate-uudi-id";

describe("generateUuid", () => {

  it("should return UUID from crypto.randomUUID", () => {
    const expected = "ac25ae73-f4b6-477e-a5fa-877c8dea863d";
    jest.spyOn(crypto, "randomUUID").mockReturnValueOnce(expected as `${string}-${string}-${string}-${string}-${string}`);

    expect(generateUuid()).toEqual(expected);
  });
});

describe("generateRequestId", () => {

  it("should return UUID from crypto.randomUUID", () => {
    const expected = "ac25ae73-f4b6-477e-a5fa-877c8dea863d";
    jest.spyOn(crypto, "randomUUID").mockReturnValueOnce(expected as `${string}-${string}-${string}-${string}-${string}`);

    expect(generateRequestId()).toEqual(expected);
  });
});
