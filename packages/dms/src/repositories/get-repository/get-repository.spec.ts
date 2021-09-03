import { Context } from "../../utils/context";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { getRepository, GetRepositoryParams } from "./get-repository";



jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockGET = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: Context;
let params: GetRepositoryParams;
let mockTransform: any;

describe("getRepository", () => {

  beforeEach(() => {

    jest.resetAllMocks();

    mockGetAxiosInstace.mockReturnValue({
      get: mockGET
    } as unknown as AxiosInstance);

    mockGET.mockResolvedValue({
      _links: {
        source: {
          href: "HiItsMeSourceId"
        }
      },
      id: "HiItsMeRepoId",
      name: "HiItsMeRepoName"
    });

    mockTransform = jest.fn();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId"
    };
  });

  it("should to GET correctly", async () => {
    await getRepository(context, params, mockTransform);

    expect(mockGET).toHaveBeenCalledTimes(1);
    expect(mockGET).toHaveBeenCalledWith("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
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
      await getRepository(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(mockMapRequestError).toHaveBeenCalledTimes(1);
    expect(mockMapRequestError).toHaveBeenCalledWith([404], "Failed to get repository", getError);
    expect(expectedError).toEqual(mappedError);
  });

  it("should return custom transform", async () => {

    const getResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockGET.mockResolvedValue(getResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    await getRepository(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(getResponse, context, params);
  });

  describe("default transform", () => {
    it("should map repository correctly", async () => {

      const repository: any = {
        _links: {
          source: {
            href: "HiItsMeSourceId"
          },
          id: "HiItsMeRepoId",
          name: "HiItsMeRepoName"
        }
      };
      mockGET.mockResolvedValue({ data: repository });

      const result = await getRepository(context, params);

      expect(result).toHaveProperty("id", repository.id);
      expect(result).toHaveProperty("name", repository.name);
      expect(result).toHaveProperty("sourceId", repository._links.source.href);
    });
  });
});

