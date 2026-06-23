import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import {
  GetRepositoryParams,
  Repository,
  onResponse,
  getRepository,
} from "./get-repository";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getRepository", () => {

  let context: DvelopContext;
  let params: GetRepositoryParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { repositoryId: "HiItsMeRepositoryId" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getRepository(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      `/dms/r/${params.repositoryId}`,
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getRepository(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_getRepositoryDefaultTransformFunction", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map repository correctly", async () => {
      const data = {
        _links: { source: { href: "HiItsMeSource" } },
        id: "HiItsMeRepoId",
        name: "HiItsMeName"
      };

      const result: Repository = await onResponse(jsonResponse(data));

      expect(result).toEqual({
        repositoryId: "HiItsMeRepoId",
        name: "HiItsMeName",
        sourceId: "HiItsMeSource"
      });
    });
  });
});
