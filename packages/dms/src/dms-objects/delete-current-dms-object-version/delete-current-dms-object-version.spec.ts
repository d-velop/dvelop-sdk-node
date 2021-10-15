import { Context } from "../../utils/context";
import { getDmsObjectFactory } from "../get-dms-object/get-dms-object";
import { HttpResponse, ForbiddenError} from "../../utils/http";
import { DeleteCurrentDmsObjectVersionParams, deleteCurrentDmsObjectVersionFactory, deleteCurrentDmsObjectVersionDefaultTransformFunction } from "./delete-current-dms-object-version";

jest.mock("../get-dms-object/get-dms-object");
const mockGetDmsObjectFactory = getDmsObjectFactory as jest.MockedFunction<typeof getDmsObjectFactory>;

describe("deleteCurrentDmsObjectVersion", () => {

  let mockGetDmsObject = jest.fn();
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: Context;
  let params: DeleteCurrentDmsObjectVersionParams;

  beforeEach(() => {

    jest.resetAllMocks();
    mockGetDmsObjectFactory.mockReturnValue(mockGetDmsObject);


    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      reason: "HiItsMeReason"
    };
  });

  it("should handle getDmsObject correctly", async () => {
    mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeHref" } } } });

    const deleteCurrentDmsObjectVersion = deleteCurrentDmsObjectVersionFactory(mockHttpRequestFunction, mockTransformFunction);
    await deleteCurrentDmsObjectVersion(context, params);

    expect(mockGetDmsObjectFactory).toHaveBeenCalledTimes(1);
    expect(mockGetDmsObjectFactory).toHaveBeenCalledWith(mockHttpRequestFunction, expect.any(Function));
  });

  [
    { should: "use delete-href", href: "HiItsMeHref", _links: { delete: { href: "HiItsMeHref" } } },
    { should: "use deleteWithReason-href", href: "HiItsMeHref", _links: { deleteWithReason: { href: "HiItsMeHref" } } },
    { should: "prioritize deleteWithReason-href", href: "HiItsMeHref", _links: { deleteWithReason: { href: "HiItsMeHref" }, delete: { href: "HiImWrong" } } },
    { should: "prioritize deleteWithReason-href", href: "HiItsMeHref", _links: { delete: { href: "HiImWrong" }, deleteWithReason: { href: "HiItsMeHref" } } }
  ].forEach(testCase => {
    it(`should ${testCase.should}`, async () => {

      mockGetDmsObject.mockResolvedValue({
        data: {
          _links: testCase._links
        }
      });

      const deleteCurrentDmsObjectVersion = deleteCurrentDmsObjectVersionFactory(mockHttpRequestFunction, mockTransformFunction);
      await deleteCurrentDmsObjectVersion(context, params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "DELETE",
        url: testCase.href,
        data: {
          reason: params.reason
        }
      });
    });
  });

  it("should throw on no deletion-href", async () => {

    mockGetDmsObject.mockResolvedValue({
      data: {
        _links: {}
      }
    });

    const deleteCurrentDmsObjectVersion = deleteCurrentDmsObjectVersionFactory(mockHttpRequestFunction, mockTransformFunction);

    let expectedError: any;
    try { await deleteCurrentDmsObjectVersion(context, params); }
    catch (e: any) {
      expectedError = e;
    }

    expect(expectedError instanceof ForbiddenError).toBeTruthy();
    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(0);
  });


  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };

    mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const deleteCurrentDmsObjectVersion = deleteCurrentDmsObjectVersionFactory(mockHttpRequestFunction, mockTransformFunction);
    const result: boolean = await deleteCurrentDmsObjectVersion(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
    expect(result).toEqual(transformResult);
  });

  describe("getDmsObjectFileDefaultTransformFunction", () => {

    [
      { should: "return true on no relevant links", _links: {}, expected: true },
      { should: "return true on no relevant links", _links: { irrelevant: { href: "HiItsMeHref" } }, expected: true },
      { should: "return false on delete-href", _links: { deleteWithReason: { href: "HiItsMeHref" } }, expected: false },
      { should: "return false on delete-href", _links: { delete: { href: "HiItsMeHref" } }, expected: false },
      { should: "return false on delete- and deleteWithReason-href", _links: { deleteWithReason: { href: "HiItsMeHref" }, delete: { href: "HiImWrong" } }, expected: false },
      { should: "return false on delete- and deleteWithReason-href", _links: { delete: { href: "HiImWrong" }, deleteWithReason: { href: "HiItsMeHref" } }, expected: false }
    ].forEach(testCase => {
      it(`should ${testCase.should}`, async () => {

        const response: HttpResponse = {
          data: { _links: testCase._links }
        } as HttpResponse;

        mockGetDmsObject.mockResolvedValue({ data: { _links: { delete: { href: "HiItsMeDeleteHref" } } } });
        mockHttpRequestFunction.mockResolvedValue(response);

        const deleteCurrentDmsObjectVersion = deleteCurrentDmsObjectVersionFactory(mockHttpRequestFunction, deleteCurrentDmsObjectVersionDefaultTransformFunction);
        const result = await deleteCurrentDmsObjectVersion(context, params);

        expect(result).toBe(testCase.expected);
      });
    });
  });
});