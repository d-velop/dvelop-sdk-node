import { DvelopContext, DvelopHttpResponse } from "@dvelop-sdk/core";
import { UnlinkDmsObjectsParams, _unlinkDmsObjectsFactory } from "./unlink-dms-objects";

describe("unlinkDmsObjects", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: UnlinkDmsObjectsParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      parentDmsObjectId: "HiItsMeParentDmsObjectId",
      childDmsObjectsId: "HiItsMeChildDmsObjectId"
    };
  });

  it("should make correct request", async () => {

    const unlinkDmsObjects = _unlinkDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
    await unlinkDmsObjects(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "DELETE",
      url: `/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children/${params.childDmsObjectsId}`,
      params: {
        "sourceid": params.sourceId
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: DvelopHttpResponse = {} as DvelopHttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const unlinkDmsObjects = _unlinkDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
    await unlinkDmsObjects(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});
