import { TenantContext } from "../../utils/tenant-context";
import { getDmsObject } from "../get-dms-object/get-dms-object";
import { AxiosError, AxiosInstance, AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { DeleteCurrentDmsObjectVersionParams, deleteCurrentDmsObjectVersion } from "./delete-current-dms-object-version";
import { ForbiddenError } from "../../utils/errors";

jest.mock("../get-dms-object/get-dms-object");
const mockGetDmsObject = getDmsObject as jest.MockedFunction<typeof getDmsObject>;

jest.mock("../../utils/http");
const mockGetAxiosInstace = getAxiosInstance as jest.MockedFunction<typeof getAxiosInstance>;
const mockDELETE = jest.fn();
const mockMapRequestError = mapRequestError as jest.MockedFunction<typeof mapRequestError>;

let context: TenantContext;
let params: DeleteCurrentDmsObjectVersionParams;
let mockTransform: any;

describe("deleteCurrentDmsObjectVersion", () => {

  beforeEach(() => {

    jest.resetAllMocks();


    mockGetAxiosInstace.mockReturnValueOnce({
      delete: mockDELETE
    } as unknown as AxiosInstance);

    mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });
    mockDELETE.mockResolvedValue({ data: {} });
    mockTransform = jest.fn();

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

  });

  it("should call getDmsObject correctly", async () => {
    await deleteCurrentDmsObjectVersion(context, params, mockTransform);
    expect(mockGetDmsObject).toHaveBeenCalledTimes(1);
    expect(mockGetDmsObject).toHaveBeenCalledWith(context, params, expect.any(Function));
  });

  it("should not catch errors", async () => {
    const error: Error = new Error("HiItsMeError");
    mockGetDmsObject.mockImplementation(() => { throw error; });

    let expectedError: Error;
    try {
      await deleteCurrentDmsObjectVersion(context, params, mockTransform);
    } catch (e) {
      expectedError = e;
    }

    expect(expectedError).toBe(error);
    expect(mockDELETE).toHaveBeenCalledTimes(0);
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
        await deleteCurrentDmsObjectVersion(context, params, mockTransform);
      } catch (e) {
        expectedError = e;
      }

      expect(expectedError instanceof ForbiddenError).toBeTruthy();
      expect(expectedError.message).toContain("Failed to delete current DmsObjectVersion:");
      expect(expectedError.message).toContain("Deletion denied for user.");
      expect(mockDELETE).toHaveBeenCalledTimes(0);
    });
  });

  describe("DELETE", () => {

    const href = "HiItsMeCorrectHref";

    [
      { testContext: "delete-href if none other present", responseData: { _links: { delete: { href: href } } } },
      { testContext: "deleteWithReason-href if none other present", responseData: { _links: { deleteWithReason: { href: href } } } },
      { testContext: "delete-href if both links present", responseData: { _links: { delete: { href: href }, deleteWithMapping: { href: "HiItsMeWrongHref" } } } },
    ].forEach(testCase => {

      it(`should have ${testCase.testContext}`, async () => {

        mockGetDmsObject.mockResolvedValue({ data: testCase.responseData });

        await deleteCurrentDmsObjectVersion(context, params, mockTransform);
        expect(mockDELETE).toHaveBeenCalledWith(href, expect.any(Object));
      });

      it("should have correct axios-params", async () => {

        mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });

        await deleteCurrentDmsObjectVersion(context, params, mockTransform);

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

    it("should throw mappedError on requestError", async () => {

      const deleteError: AxiosError = {
        message: "HiItsMeErrorMessage"
      } as AxiosError;
      mockDELETE.mockRejectedValue(deleteError);

      const mappedError: Error = new Error("HiItsMeMappedError");
      mockMapRequestError.mockReturnValue(mappedError);

      let expectedError: Error;
      try {
        await deleteCurrentDmsObjectVersion(context, params, mockTransform);
      } catch (e) {
        expectedError = e;
      }

      expect(mockMapRequestError).toHaveBeenCalledTimes(1);
      expect(mockMapRequestError).toHaveBeenCalledWith([], "Failed to delete current DmsObjectVersion", deleteError);
      expect(expectedError).toEqual(mappedError);
    });
  });

  it("should return custom transform", async () => {

    const deleteResponse: AxiosResponse<any> = {
      data: { test: "HiItsMeTest" }
    } as AxiosResponse;
    mockDELETE.mockResolvedValue(deleteResponse);

    const transformResult = "HiItsMeTransformResult";
    mockTransform.mockReturnValue(transformResult);

    await deleteCurrentDmsObjectVersion(context, params, mockTransform);

    expect(mockTransform).toHaveBeenCalledTimes(1);
    expect(mockTransform).toHaveBeenCalledWith(deleteResponse, context, params);
  });

  describe("default transform", () => {

    [
      { _links: { delete: { href: "HiItsMeDeleteHref" } } },
      { _links: { deleteWithReason: { href: "HiItsMeDeleteWithReasonHref" } } },
      { _links: { delete: { href: "HiItsMeDeleteHref" }, deleteWithReason: { href: "HiItsMeDeleteWithReasonHref" } } }
    ].forEach(testCase => {
      it("should return false on data", async () => {
        mockDELETE.mockResolvedValue({data: testCase});
        const result: boolean = await deleteCurrentDmsObjectVersion(context, params);
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
      it(`should return true on no data: '${testCase}'`, async () => {
        mockDELETE.mockResolvedValue({data: testCase});
        const result: boolean = await deleteCurrentDmsObjectVersion(context, params);
        expect(result).toBeTruthy();
      });
    });
  });
});