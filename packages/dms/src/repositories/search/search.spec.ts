import axios, { AxiosResponse } from "axios";
import { DmsApiError } from "../../errors";
import { search, SearchResultPage, UnauthorizedError } from "../../index";

jest.mock("axios");

describe("search", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          _links: {
            next: {
              href: "HiItsMeNextHref"
            }
          },
          page: 1
        }
      });
    });

    it("should send GET", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await search(systemBaseUri, "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await search("HiItsMeSystemBaseUri", authSessionId, {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo", "searchresultwithmapping"]
      }));
    });

    it("should send with templates: repositoryid", async () => {
      const repositoryId: string = "HiItsMeRepositoryId";
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: repositoryId,
        sourceId: "HiItsMeSourceId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "repositoryid": repositoryId })
      }));
    });

    it("should send with templates: sourceid", async () => {
      const sourceId: string = "HiItsMeSourceId";
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: sourceId
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "sourceid": sourceId })
      }));
    });

    it("should send with templates: fulltext", async () => {
      const fulltext: string = "HiItsMeFulltext";
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        fulltext: fulltext
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "fulltext": fulltext })
      }));
    });
  });

  describe("result", () => {

    it("should return result-page", async () => {

      const data: any = {
        page: 1
      };

      mockedAxios.get.mockResolvedValue({ data });

      const result: SearchResultPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      });

      expect(result.pageNumber).toEqual(1);
      expect(result.getNextPage).toBeFalsy();
    });

    describe("getNextPage", () => {

      const data1 = {
        page: 1,
        _links: {
          next: {
            href: "HiItsMeNextHrefToSecondPage"
          }
        }
      };

      const data2 = {
        page: 2,
        _links: {
          next: {
            href: "HiItsMeNextHrefToThirdPage"
          }
        }
      };

      const data3 = {
        page: 3,
        _links: {}
      };

      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      const authSessionId: string = "HiItsMeAuthSessionId";

      let firstPage: SearchResultPage;
      let secondPage: SearchResultPage;
      let thirdPage: SearchResultPage;

      describe("called once", () => {

        describe("axios-params", () => {

          beforeEach(async () => {

            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();
          });

          it("should send GET twice", async () => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
          });

          it("should send to correct link", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(2, data1._links.next.href, expect.any(Object));
          });

          it("should send with systemBaseUri as BaseURL", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(2, expect.any(String), expect.objectContaining({
              baseURL: systemBaseUri
            }));
          });

          it("should send with authSessionId as Authorization-Header", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(2, expect.any(String), expect.objectContaining({
              headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
            }));
          });
        });

        describe("result", () => {
          it("should return result-page", async () => {
            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();

            expect(secondPage.pageNumber).toEqual(data2.page);
            expect(secondPage).toHaveProperty("getNextPage", expect.any(Function));
          });
        });

        describe("errors", () => {

          it("should throw UnauthorizesError on status 401", async () => {

            const response: AxiosResponse = {
              status: 401,
            } as AxiosResponse;

            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockRejectedValueOnce({ response });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });

            let error: UnauthorizedError;
            try {
              secondPage = await firstPage.getNextPage();
            } catch (e) {
              error = e;
            }

            expect(error instanceof UnauthorizedError).toBeTruthy();
            expect(error.message).toContain("Failed to search repository:");
            expect(error.response).toEqual(response);
          });

          it("should throw UnknownErrors", async () => {

            const errorString: string = "HiItsMeError";
            const error: Error = new Error(errorString);
            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockImplementation(() => {
                throw error;
              });

            await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });

            let resultError: Error;
            try {
              secondPage = await firstPage.getNextPage();
            } catch (e) {
              resultError = e;
            }

            expect(resultError).toBe(error);
            expect(resultError.message).toContain(errorString);
            expect(resultError.message).toContain("Failed to search repository:");
          });
        });
      });

      describe("called twice", () => {

        describe("axios-params", () => {

          beforeEach(async () => {

            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 })
              .mockResolvedValueOnce({ data: data3 });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();
            thirdPage = await secondPage.getNextPage();
          });

          it("should send GET thrice", async () => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(3);
          });

          it("should send to correct link", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(3, data2._links.next.href, expect.any(Object));
          });

          it("should send with systemBaseUri as BaseURL", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(3, expect.any(String), expect.objectContaining({
              baseURL: systemBaseUri
            }));
          });

          it("should send with authSessionId as Authorization-Header", async () => {
            expect(mockedAxios.get).toHaveBeenNthCalledWith(3, expect.any(String), expect.objectContaining({
              headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
            }));
          });
        });

        describe("result", () => {
          it("should return result-page", async () => {
            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 })
              .mockResolvedValueOnce({ data: data3 });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();
            thirdPage = await secondPage.getNextPage();

            expect(thirdPage.pageNumber).toEqual(data3.page);
            expect(thirdPage.getNextPage).toBeFalsy();
          });
        });

        describe("errors", () => {

          it("should throw UnauthorizesError on status 401", async () => {

            const response: AxiosResponse = {
              status: 401,
            } as AxiosResponse;

            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 })
              .mockRejectedValueOnce({ response });

            firstPage = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();

            let error: UnauthorizedError;
            try {
              thirdPage = await secondPage.getNextPage();
            } catch (e) {
              error = e;
            }

            expect(error instanceof UnauthorizedError).toBeTruthy();
            expect(error.message).toContain("Failed to search repository:");
            expect(error.response).toEqual(response);
          });

          it("should throw UnknownErrors", async () => {

            const errorString: string = "HiItsMeError";
            const error: Error = new Error(errorString);
            mockedAxios.get
              .mockResolvedValueOnce({ data: data1 })
              .mockResolvedValueOnce({ data: data2 })
              .mockImplementation(() => {
                throw error;
              });

            await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
              repositoryId: "HiItsMeRepositoryId",
              sourceId: "HiItsMeSourceId"
            });
            secondPage = await firstPage.getNextPage();

            let resultError: Error;
            try {
              thirdPage = await secondPage.getNextPage();
            } catch (e) {
              resultError = e;
            }

            expect(resultError).toBe(error);
            expect(resultError.message).toContain(errorString);
            expect(resultError.message).toContain("Failed to search repository:");
          });
        });
      });
    });
  });

  describe("errors", () => {

    it("should throw DmsApiError on status 400", async () => {

      const errorString: string = "HiItsMeApiError";

      const response: AxiosResponse = {
        status: 400,
        data: {
          reason: errorString
        }
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error;
      try {
        await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        error = e;
      }

      expect(error instanceof DmsApiError).toBeTruthy();
      expect(error.message).toContain("Failed to search repository:");
      expect(error.errorString).toEqual(errorString);
      expect(error.response).toEqual(response);
    });

    it("should throw UnauthorizesError on status 401", async () => {

      const response: AxiosResponse = {
        status: 401,
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: UnauthorizedError;
      try {
        await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to search repository:");
      expect(error.response).toEqual(response);
    });

    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.get.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to search repository:");
    });
  });
});