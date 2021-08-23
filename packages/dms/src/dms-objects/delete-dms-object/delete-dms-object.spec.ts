import axios, { AxiosResponse } from "axios";
import { TenantContext, deleteDmsObject } from "../../index";
import { DeleteDmsObjectParams } from "./delete-dms-object";

jest.mock("axios");

describe("deleteDmsObject", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: TenantContext;
  let params: DeleteDmsObjectParams;

  beforeEach(() => {

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    mockedAxios.get.mockReset();
    mockedAxios.delete.mockReset();
    mockedAxios.isAxiosError.mockReset();
  });

  describe("axios-params", () => {

    const deleteHref = "HiItsMeDeleteHref";

    async function testGET() {
      describe("GET", () => {

        it("should send GET", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it("should send to /dms", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
        });

        it("should send with systemBaseUri as BaseURL", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            baseURL: context.systemBaseUri
          }));
        });

        it("should send with authSessionId as Authorization-Header", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            headers: expect.objectContaining({ "Authorization": `Bearer ${context.authSessionId}` })
          }));
        });

        it("should send with follows: repo, dmsobjectwithmapping", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            follows: ["repo", "dmsobjectwithmapping"]
          }));
        });

        it("should send with templates: dmsObjectid, dmsobjectid & sourceid", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            templates: {
              "repositoryid": params.repositoryId,
              "dmsobjectid": params.dmsObjectId,
              "sourceid": params.sourceId
            }
          }));
        });
      });
    }

    async function testDELETE(expectedCalls: number) {
      describe("DELETE", () => {
        it(`should send DELETE ${expectedCalls} times`, async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.delete).toHaveBeenCalledTimes(expectedCalls);
        });

        it("should send to correct uri", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.delete).toHaveBeenCalledWith(deleteHref, expect.any(Object));
        });

        it("should send with systemBaseUri as BaseURL", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.delete).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            baseURL: context.systemBaseUri
          }));
        });

        it("should send with authSessionId as Authorization-Header", async () => {
          await deleteDmsObject(context, params, (_) => { });
          expect(mockedAxios.delete).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            headers: expect.objectContaining({ "Authorization": `Bearer ${context.authSessionId}` })
          }));
        });
      });
    }

    [
      { deleteResponse: { _links: { delete: { href: deleteHref } } } },
      { deleteResponse: { _links: { deleteWithReason: { href: deleteHref } } } },
      { deleteResponse: { _links: { delete: { href: deleteHref }, deleteWithReason: { href: "irrelevant" } } } }
    ].forEach(testCase => {

      describe("current version", () => {

        beforeEach(() => {
          params = {
            repositoryId: "HiItsMeRepositoryId",
            sourceId: "HiItsMeSourceId",
            dmsObjectId: "HiItsMeDmsObjectId",
            reason: "HiItsMeReasone",
            versions: "current"
          };

          mockedAxios.get.mockResolvedValue({
            data: { _links: testCase.deleteResponse._links }
          });

          mockedAxios.delete.mockResolvedValueOnce({
            data: { _links: testCase.deleteResponse._links }
          });
        });

        testGET();
        testDELETE(1);
      });

      describe("all versions - one available", () => {

        beforeEach(() => {
          params = {
            repositoryId: "HiItsMeRepositoryId",
            sourceId: "HiItsMeSourceId",
            dmsObjectId: "HiItsMeDmsObjectId",
            reason: "HiItsMeReasone",
            versions: "all - i know what i'm doing"
          };

          mockedAxios.get.mockResolvedValue({
            data: { _links: testCase.deleteResponse._links }
          });

          mockedAxios.delete.mockResolvedValue({ data: null });
        });

        testGET();
        testDELETE(1);
      });

      describe("all versions - three available", () => {

        beforeEach(() => {
          params = {
            repositoryId: "HiItsMeRepositoryId",
            sourceId: "HiItsMeSourceId",
            dmsObjectId: "HiItsMeDmsObjectId",
            reason: "HiItsMeReasone",
            versions: "all - i know what i'm doing"
          };

          mockedAxios.get.mockResolvedValue({
            data: { _links: testCase.deleteResponse._links }
          });

          mockedAxios.delete
            .mockResolvedValueOnce({
              data: { _links: testCase.deleteResponse._links }
            })
            .mockResolvedValueOnce({
              data: { _links: testCase.deleteResponse._links }
            })
            .mockResolvedValueOnce({ data: null });
        });

        testGET();
        testDELETE(3);
      });
    });
  });

  describe("transform", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: { _links: { delete: { href: "HiItsMeDeleteHref" } } }
      });

      mockedAxios.delete.mockResolvedValueOnce({
        data: null
      });
    });

    describe("current version", () => {

      beforeEach(() => {
        params = {
          repositoryId: "HiItsMeRepositoryId",
          sourceId: "HiItsMeSourceId",
          dmsObjectId: "HiItsMeDmsObjectId",
          reason: "HiItsMeReasone",
          versions: "current"
        };
      });

      it("should call default transform-function with result and return", async () => {
        const result: void = await deleteDmsObject(context, params);
        expect(result).toBeFalsy();
      });

      it("should call given transform-function with result and return", async () => {
        const transformResult = "HiItsMeTransformResult";
        const mockedTransform: (response: AxiosResponse)=> string = jest.fn().mockReturnValue(transformResult);

        const result: string = await deleteDmsObject<string>(context, params, mockedTransform);

        expect(mockedTransform).toHaveBeenCalledTimes(1);
        expect(mockedTransform).toHaveBeenCalledWith({ data: null });
        expect(result).toBe(transformResult);
      });

    });

    describe("all versions", () => {

      beforeEach(() => {
        params = {
          repositoryId: "HiItsMeRepositoryId",
          sourceId: "HiItsMeSourceId",
          dmsObjectId: "HiItsMeDmsObjectId",
          reason: "HiItsMeReasone",
          versions: "current"
        };
      });

      it("should call default transform-function with result and return", async () => {
        const result: void = await deleteDmsObject(context, params);
        expect(result).toBeFalsy();
      });

      it("should call given transform-function with result and return", async () => {
        const transformResult = "HiItsMeTransformResult";
        const mockedTransform: (response: AxiosResponse)=> string = jest.fn().mockReturnValue(transformResult);

        const result: string = await deleteDmsObject<string>(context, params, mockedTransform);

        expect(mockedTransform).toHaveBeenCalledTimes(1);
        expect(mockedTransform).toHaveBeenCalledWith({ data: null });
        expect(result).toBe(transformResult);
      });
    });
  });
});
