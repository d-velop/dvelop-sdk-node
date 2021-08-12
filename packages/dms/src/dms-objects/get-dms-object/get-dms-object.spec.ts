import axios, { AxiosResponse } from "axios";
import { GetDmsObjectParams, DmsObject, getDmsObject, DmsAppBadRequestError, DmsObjectNotFoundError, internals } from "../../index";

jest.mock("axios");

describe("getDmsObject", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  describe("axios-params", () => {

    const params: GetDmsObjectParams = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      sourceId: "HiItsMeSourceId"
    };

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          id: "HiItsMeRepositoryId",
          name: "HiItsMeRepsitoryName"
        }
      });
    });

    it("should send GET", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getDmsObject(systemBaseUri, "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await getDmsObject("HiItsMeSystemBaseUri", authSessionId, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: repo, dmsobjectwithmapping", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo", "dmsobjectwithmapping"]
      }));
    });

    it("should send with templates: repositoryid", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "repositoryid": params.repositoryId })
      }));
    });

    it("should send with templates: dmsobjectid", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "dmsobjectid": params.dmsObjectId, })
      }));
    });

    it("should send with templates: sourceid", async () => {
      await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "sourceid": params.sourceId })
      }));
    });
  });



  describe("transform", () => {

    it("should return transform-result", async () => {

      const response = {
        test: "HiItsMeTest"
      } as unknown as AxiosResponse<internals.DmsObjectWithMappingDto>;
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      const authSessionId: string = "HiItsMeAuthSessionId";
      const params: GetDmsObjectParams = {
        repositoryId: "HiItsMeRepositoryId",
        dmsObjectId: "HiItsMeDmsObjectId",
        sourceId: "HiItsMeSourceId"
      };
      const transformResult = "HiItsMeTransformResult";

      mockedAxios.get.mockResolvedValue(response);
      const mockedTransform = jest.fn().mockReturnValue(transformResult);


      const result = await getDmsObject(systemBaseUri, authSessionId, params, mockedTransform);

      expect(mockedTransform).toHaveBeenCalledTimes(1);
      expect(mockedTransform).toHaveBeenCalledWith(response, systemBaseUri, authSessionId, params);
      expect(result).toBe(transformResult);
    });
  });

  describe("errors", () => {
    it("should throw DmsAppBadRequestError on status 400", async () => {

      const errorString: string = "HiItsMeError";
      const response: AxiosResponse = {
        status: 400,
        data: {
          reason: errorString
        }
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: DmsAppBadRequestError;
      try {
        await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          dmsObjectId: "HiItsMeDmsObjectId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        error = e;
      }

      expect(error instanceof DmsAppBadRequestError).toBeTruthy();
      expect(error.message).toContain("Failed to get DmsObject:");
      expect(error.message).toContain(errorString);
      expect(error.requestError.response).toEqual(response);
    });

    it("should throw DmsObjectNotFoundError on status 404", async () => {

      const errorString: string = "HiItsMeError";
      const response: AxiosResponse = {
        status: 404,
        data: {
          reason: errorString
        }
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: DmsObjectNotFoundError;
      try {
        await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          dmsObjectId: "HiItsMeDmsObjectId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        error = e;
      }

      expect(error instanceof DmsObjectNotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to get DmsObject:");
      expect(error.message).toContain(errorString);
      expect(error.requestError.response).toEqual(response);
    });

    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.get.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await getDmsObject("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId",
          dmsObjectId: "HiItsMeDmsObjectId",
          sourceId: "HiItsMeSourceId"
        });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get DmsObject:");
    });
  });

  describe("transformGetDmsObjectResponseToDmsObject", () => {
    it("should map values", () => {

      const response = {
        data: {
          id: "HiItsMeDmsObjectId",
          sourceProperties: [{
            key: "HiItsMeProperty1Key",
            value: "HiItsMeProperty1Value",
            values: {},
            displayValue: "HiItsMeProperty1DisplayValue"
          },
          {
            key: "HiItsMeProperty2Key",
            value: "HiItsMeProperty2Value"
          }],
          sourceCategories: ["HiItsmeCategory"],
          _links: {
            someLink: {
              href: "irrelevant"
            }
          }
        }
      } as unknown as AxiosResponse<internals.DmsObjectWithMappingDto>;

      const systemBaseUri = "HiItsmeSystemBaseUri";
      const authSessionId = "HiItsmeAuthSessionId";
      const params: GetDmsObjectParams = {
        repositoryId: "HiItsMeRepositoryId",
        dmsObjectId: "HiItsMeDmsObjectId",
        sourceId: "HiItsMeSourceId"
      };

      const result: DmsObject = internals.transformGetDmsObjectResponseToDmsObject(response, systemBaseUri, authSessionId, params);

      expect(result.repositoryId).toEqual(params.repositoryId);
      expect(result.id).toEqual(response.data.id);
      expect(result.categories).toEqual(response.data.sourceCategories);
      expect(result.properties).toEqual(response.data.sourceProperties);
    });
  });
});