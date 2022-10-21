import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { _updateDmsObjectStatusDefaultTransformFunction, _updateDmsObjectStatusFactory, UpdateDmsObjectStatusParams } from "./update-dms-object-status";

describe("updateDmsObject", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: UpdateDmsObjectStatusParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      dmsObjectId: "HiItsMeDmsObjectId",
      status: "Processing",
    };
  });

  it("should make correct request", async () => {
    const updateDmsObject = _updateDmsObjectStatusFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "PUT",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "displayVersion"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "sourceId": `/dms/r/${params.repositoryId}/source`,
        "sourceProperties": {
          "properties": [
            { key: "property_state", values: [params.status] }
          ]
        }
      }
    });
  });

  it("should include editor if given", async () => {

    params.editor = "HiItsMeEditor"

    const updateDmsObject = _updateDmsObjectStatusFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        "sourceProperties": expect.objectContaining({
          "properties": expect.arrayContaining([
            { key: "property_editor", values: [params.editor] }
          ])
        })
      })
    }));
  });

  it("should alterationtext if given", async () => {

    params.alterationText = "HiItsMeAlterationText";

    const updateDmsObject = _updateDmsObjectStatusFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateDmsObject(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        "alterationText": params.alterationText
      })
    }));
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const updateDmsObject = _updateDmsObjectStatusFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateDmsObject(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("updateDmsObjectDefaultTransformer", () => {

    it("should return void", async () => {
      const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const updateDmsObject = _updateDmsObjectStatusFactory(mockHttpRequestFunction, _updateDmsObjectStatusDefaultTransformFunction);
      const result = await updateDmsObject(context, params);

      expect(result).toBe(undefined);
    });
  });
});
