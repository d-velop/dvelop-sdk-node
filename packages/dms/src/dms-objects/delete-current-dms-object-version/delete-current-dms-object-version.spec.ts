import { TenantContext } from "../../utils/tenant-context";
import { getDmsObject } from "../get-dms-object/get-dms-object";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, isAxiosError, mapAxiosError } from "../../utils/http";
import { DeleteCurrentDmsObjectVersionParams, deleteCurrentDmsObjectVersion, DeleteCurrentDmsObjectVersionTransformer, deleteCurrentDmsObjectVersionDefaultTransformer } from "./delete-current-dms-object-version";
import { ServiceDeniedError } from "../../utils/errors";

jest.mock("../get-dms-object/get-dms-object");
const mockGetDmsObject = getDmsObject as jest.MockedFunction<typeof getDmsObject>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockDELETE = jest.fn();
const mockIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;
const mockMapAxiosError = mapAxiosError as jest.MockedFunction<typeof mapAxiosError>;

describe("deleteCurrentDmsObjectVersion", () => {

  let context: TenantContext;
  let params: DeleteCurrentDmsObjectVersionParams;
  let transform: DeleteCurrentDmsObjectVersionTransformer<any>;

  beforeEach(() => {

    jest.resetAllMocks();

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

    mockGetAxiosInstace.mockReturnValueOnce({
      delete: mockDELETE
    } as unknown as AxiosInstance);

    mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });
    mockDELETE.mockResolvedValue({ data: {} });

  });

  it("should call getDmsObject correctly", async () => {
    await deleteCurrentDmsObjectVersion(context, params, transform);
    expect(mockGetDmsObject).toHaveBeenCalledTimes(1);
    expect(mockGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
  });

  it("should not catch errors", async () => {
    const error: Error = new Error("HiItsMeError");
    mockGetDmsObject.mockImplementation(() => { throw error; });

    let expectedError: Error;
    try {
      await deleteCurrentDmsObjectVersion(context, params, transform);
    } catch (e) {
      expectedError = e;
    }

    expect(expectedError).toBe(error);
  });

  [
    null,
    undefined,
    {},
    { _links: null },
    { _links: undefined },
    { _links: {} },
    { _links: { someIrrelevantLink: { href: "HiItsMeIrrelevantLink" } } },
    { _links: { delete: null } },
    { _links: { delete: undefined } },
    { _links: { delete: {} } },
    { _links: { delete: { href: "" } } },
    { _links: { delete: { href: null } } },
    { _links: { delete: { href: undefined } } },
    { _links: { deleteWithReason: null } },
    { _links: { deleteWithReason: undefined } },
    { _links: { deleteWithReason: {} } },
    { _links: { deleteWithReason: { href: "" } } },
    { _links: { deleteWithReason: { href: null } } },
    { _links: { deleteWithReason: { href: undefined } } },
  ].forEach(testCase => {
    it("should throw on no links", async () => {

      mockGetDmsObject.mockResolvedValue({ data: testCase });

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

        mockGetDmsObject.mockResolvedValue({ data: testCase.responseData });

        await deleteCurrentDmsObjectVersion(context, params, transform);
        expect(mockDELETE).toHaveBeenCalledWith(href, expect.any(Object));
      });

      it("should have correct axios-params", async () => {

        mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });

        await deleteCurrentDmsObjectVersion(context, params, transform);

        expect(mockDELETE).toHaveBeenCalledTimes(1);

        expect(mockDELETE).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          baseURL: context.systemBaseUri
        }));

        expect(mockDELETE).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
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
      mockDELETE.mockRejectedValue(deleteError);

      mockIsAxiosError.mockReturnValue(true);

      const mappedError: Error = new Error("HiItsMeMappedError");
      mockMapAxiosError.mockReturnValue(mappedError);

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockIsAxiosError).toHaveBeenCalledWith(deleteError);
      expect(mockMapAxiosError).toHaveBeenCalledTimes(1);
      expect(mockMapAxiosError).toHaveBeenCalledWith("Failed to delete current DmsObjectVersion", deleteError);
      expect(expectedError).toEqual(mappedError);
    });

    it("should throw on non axiosError", async () => {

      const deleteError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockDELETE.mockRejectedValue(deleteError);

      mockIsAxiosError.mockReturnValue(false);

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, transform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(mockIsAxiosError).toHaveBeenCalledWith(deleteError);
      expect(mockMapAxiosError).toHaveBeenCalledTimes(0);
      expect(expectedError).toEqual(deleteError);
      expect(expectedError.message).toContain("Failed to delete current DmsObjectVersion");
    });
  });

  it("should call transform", async () => {

    const deleteResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockDELETE.mockResolvedValue(deleteResponse);

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