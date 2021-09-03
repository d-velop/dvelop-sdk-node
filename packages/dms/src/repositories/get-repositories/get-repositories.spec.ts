import { Context } from "../../utils/context";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { getRepositories } from "./get-repositories";

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockGET = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: Context;
let mockTransform: any;

describe("getRepositories", () => {

  beforeEach(() => {

    jest.resetAllMocks();

    mockGetAxiosInstace.mockReturnValue({
      get: mockGET
    } as unknown as AxiosInstance);

    mockGET.mockResolvedValue({ data: { repositories: [] } });
    mockTransform = jest.fn();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };
  });

  it("should to GET correctly", async () => {

    await getRepositories(context);

    expect(mockGET).toHaveBeenCalledTimes(1);
    expect(mockGET).toHaveBeenCalledWith("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["allrepos"]
    });
  });

  it("should throw mappedError on requestError", async () => {

    const getError: AxiosError = {
      message: "HiItsMeErrorMessage"
    } as AxiosError;
    mockGET.mockRejectedValue(getError);

    const mappedError: Error = new Error("HiItsMeMappedError");
    mockMapRequestError.mockReturnValue(mappedError);

    let expectedError: Error;
    try {
      await getRepositories(context, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([], "Failed to get repositories", getError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {

    const getResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockGET.mockResolvedValue(getResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    await getRepositories(context, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(getResponse, context);
  });

  describe("default transform", () => {

    [
      { repositories: [] },
      { repositories: [{ id: "HiItsMeId", name: "HiItsMeName", _links: { source: { href: "HiItsMeSource" } } }] },
      { repositories: [{ id: "HiItsMeId1", name: "HiItsMeName1", _links: { source: { href: "HiItsMeSource1" } } }, { id: "HiItsMeId2", name: "HiItsMeName2", _links: { source: { href: "HiItsMeSource2" } } }] },
    ].forEach(testCase => {
      it(`should map ${testCase.repositories.length} repositories correctly`, async () => {
        mockGET.mockResolvedValue({ data: testCase });
        const result = await getRepositories(context);

        expect(result.length).toBe(testCase.repositories.length);
        result.forEach((r, i) => {
          expect(r).toHaveProperty("id", testCase.repositories[i].id);
          expect(r).toHaveProperty("name", testCase.repositories[i].name);
          expect(r).toHaveProperty("sourceId", testCase.repositories[i]._links.source.href);
        });
      });
    });
  });
});
