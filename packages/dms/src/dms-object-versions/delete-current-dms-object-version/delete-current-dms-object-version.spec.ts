import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import * as index from "../../index";
import { ServiceDeniedError } from "../../utils/errors";
import { TenantContext } from "../../utils/tenant-context";
import { deleteCurrentDmsObjectVersion, deleteCurrentDmsObjectVersionDefaultTransformer, DeleteCurrentDmsObjectVersionParams, DeleteCurrentDmsObjectVersionTransformer } from "./delete-current-dms-object-version";

jest.mock("../../index");
jest.mock("../../utils/http");

describe("deleteCurrentDmsObjectVersion", () => {

  const mockedGetDmsObject = jest.fn();
  const mockedAxiosDelete = jest.fn();
  const mockedIsAxiosError = jest.fn();
  const mockedMapAxiosError = jest.fn();

  let context: TenantContext;
  let params: DeleteCurrentDmsObjectVersionParams;
  let transform: DeleteCurrentDmsObjectVersionTransformer<any>;

  beforeAll(() => {
    jest.spyOn(index, "getDmsObject").mockImplementation(mockedGetDmsObject);
    jest.spyOn(index._http, "getAxiosInstance").mockReturnValue({ delete: mockedAxiosDelete } as unknown as AxiosInstance);
    jest.spyOn(index._http, "isAxiosError").mockImplementation(mockedIsAxiosError);
    jest.spyOn(index._http, "mapAxiosError").mockImplementation(mockedMapAxiosError);
  });

  beforeEach(() => {

    mockedGetDmsObject.mockReset();
    mockedAxiosDelete.mockReset();
    mockedIsAxiosError.mockReset();
    mockedMapAxiosError.mockReset();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      reason: "HiItsMeReason"
    };

    transform = jest.fn();

    mockedGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });
    mockedAxiosDelete.mockResolvedValue({ data: {} });
  });

  it("should call getDmsObject correctly", async () => {
    await deleteCurrentDmsObjectVersion(context, params, transform);
    expect(mockedGetDmsObject).toHaveBeenCalledTimes(1);
    expect(mockedGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
  });

  it("should not catch errors", async () => {
    const error: Error = new Error("HiItsMeError");
    mockedGetDmsObject.mockImplementation(() => { throw error; });

    let expectedError: Error;
    try {
      await deleteCurrentDmsObjectVersion(context, params, transform);
    } catch (e) {
      expectedError = e;
    }

    expect(expectedError).toBe(error);
  });

  [
    {},
    { _links: {} },
    { _links: { someIrrelevantLink: { href: "HiItsMeIrrelevantLink" } } },
    { _links: { delete: {} } },
    { _links: { delete: { href: "" } } },
    { _links: { delete: { href: null } } },
    { _links: { delete: { href: undefined } } },
    { _links: { deleteWithReason: {} } },
    { _links: { deleteWithReason: { href: "" } } },
    { _links: { deleteWithReason: { href: null } } },
    { _links: { deleteWithReason: { href: undefined } } },
  ].forEach(testCase => {
    it("should throw on no links", async () => {

      mockedGetDmsObject.mockResolvedValue({ data: testCase });

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof ServiceDeniedError).toBeTruthy();
      expect(expectedError.message).toContain("Failed to delete current DmsObjectVersion:");
      expect(expectedError.message).toContain("No deletion-href found indicating missing permissions.");
    });
  });

  describe("http DELETE", () => {

    const href = "HiItsMeCorrectHref";

    [
      { testContext: "delete-href if none other present", responseData: { _links: { delete: { href: href } } } },
      { testContext: "deleteWithReason-href if none other present", responseData: { _links: { deleteWithReason: { href: href } } } },
      { testContext: "delete-href if both links present", responseData: { _links: { delete: { href: href }, deleteWithMapping: { href: "HiItsMeWrongHref" } } } },
    ].forEach(testCase => {

      it(`should have ${testCase.testContext}`, async () => {

        mockedGetDmsObject.mockResolvedValue({ data: testCase.responseData });

        await deleteCurrentDmsObjectVersion(context, params, transform);
        expect(mockedAxiosDelete).toHaveBeenCalledWith(href, expect.any(Object));
      });

      it("should have correct axios-params", async () => {

        mockedGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });

        await deleteCurrentDmsObjectVersion(context, params, transform);

        expect(mockedAxiosDelete).toHaveBeenCalledTimes(1);

        expect(mockedAxiosDelete).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          baseURL: context.systemBaseUri
        }));

        expect(mockedAxiosDelete).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          headers: expect.objectContaining({
            "Authorization": `Bearer ${context.authSessionId}`,
            "Accept": "application/hal+json",
            "Content-Type": "application/hal+json"
          })
        }));
      });
    });

    it("should throw mappedError on axiosError", async () => {

      const deleteError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockedAxiosDelete.mockRejectedValue(deleteError);

      mockedIsAxiosError.mockReturnValue(true);

      const mappedError: Error = new Error("HiItsMeMappedError");
      mockedMapAxiosError.mockReturnValue(mappedError);

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockedIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedIsAxiosError).toHaveBeenCalledWith(deleteError);
      expect(mockedMapAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedMapAxiosError).toHaveBeenCalledWith("Failed to delete current DmsObjectVersion", deleteError);
      expect(expectedError).toEqual(mappedError);
    });

    it("should throw on non axiosError", async () => {

      const deleteError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockedAxiosDelete.mockRejectedValue(deleteError);

      mockedIsAxiosError.mockReturnValue(false);

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockedIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockedIsAxiosError).toHaveBeenCalledWith(deleteError);
      expect(mockedMapAxiosError).toHaveBeenCalledTimes(0);
      expect(expectedError).toEqual(deleteError);
      expect(expectedError.message).toContain("Failed to delete current DmsObjectVersion");
    });
  });

  it("should call transform", async () => {

    const deleteResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockedAxiosDelete.mockResolvedValue(deleteResponse);

    await deleteCurrentDmsObjectVersion(context, params, transform);

    expect(transform).toHaveBeenCalledTimes(1);
    expect(transform).toHaveBeenCalledWith(deleteResponse, context, params);
  });
});

describe("deleteCurrentDmsObjectVersionDefaultTransformer", () => {

  [
    { _links: { delete: { href: "HiItsMeDeleteHref" } } },
    { _links: { deleteWithReason: { href: "HiItsMeDeleteWithReasonHref" } } },
    { _links: { delete: { href: "HiItsMeDeleteHref" }, deleteWithReason: { href: "HiItsMeDeleteWithReasonHref" } } }
  ].forEach(testCase => {
    it("should return true on data", () => {
      const response: AxiosResponse = { data: testCase } as AxiosResponse;
      const result: boolean = deleteCurrentDmsObjectVersionDefaultTransformer(response, {} as TenantContext, {} as DeleteCurrentDmsObjectVersionParams);
      expect(result).toBeFalsy();
    });
  });

  [
    null,
    undefined,
    {},
    { _links: null },
    { _links: undefined },
    { _links: {} },
    { _links: { irrelevant: "HiImIrrelevant" } },
  ].forEach(testCase => {
    it(`should return false on data: '${testCase}'`, () => {
      const response: AxiosResponse = { data: testCase } as AxiosResponse;
      const result: boolean = deleteCurrentDmsObjectVersionDefaultTransformer(response, {} as TenantContext, {} as DeleteCurrentDmsObjectVersionParams);
      expect(result).toBeTruthy();
    });
  });

});