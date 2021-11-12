import * as uuid from "uuid";
import { generateRequestId } from "./generate-request-id";

jest.mock("uuid");

describe("generateRequestId", () => {

  const mockedUuid = uuid as jest.Mocked<typeof uuid>;

  beforeEach(() => {
    mockedUuid.v4.mockReset();
  });

  it("should return UUID from v4", () => {
    const uuid = "HiItsMeUuid";

    mockedUuid.v4.mockImplementation(() => uuid);

    const result = generateRequestId();
    expect(result).toEqual(uuid);
  });
});