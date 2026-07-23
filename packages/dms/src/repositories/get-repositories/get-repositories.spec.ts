import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { Repository } from "../get-repository/get-repository";
import { onResponse, getRepositories } from "./get-repositories";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getRepositories", () => {

  let context: DvelopContext;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getRepositories(context);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/dms/r",
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getRepositories(context, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("_getRepositoriesDefaultTransformFunction", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map repositories correctly", async () => {
      const data = {
        repositories: [
          { _links: { source: { href: "HiItsMeSource1" } }, id: "HiItsMeRepoId1", name: "HiItsMeName1" },
          { _links: { source: { href: "HiItsMeSource2" } }, id: "HiItsMeRepoId2", name: "HiItsMeName2" }
        ]
      };

      const result: Repository[] = await onResponse(jsonResponse(data));

      expect(result).toEqual([
        { repositoryId: "HiItsMeRepoId1", name: "HiItsMeName1", sourceId: "/dms/r/HiItsMeRepoId1/source" },
        { repositoryId: "HiItsMeRepoId2", name: "HiItsMeName2", sourceId: "/dms/r/HiItsMeRepoId2/source" }
      ]);
    });
  });
});
