import { DvelopContext, DvelopHttpResponse } from "@dvelop-sdk/core";
import { LinkDmsObjectsParams, _linkDmsObjectsFactory } from "./link-dms-objects";

describe("linkDmsObjects", () => {
  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: LinkDmsObjectsParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      parentDmsObjectId: "HiItsMeDmsObjectId",
      childDmsObjectsIds: [
        "HiItsMeChildDmsObjectId1",
        "HiItsMeChildDmsObjectId2",
        "HiItsMeChildDmsObjectId3"
      ]
    };
  });

  it("should make correct request", async () => {

    const linkDmsObjects = _linkDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
    await linkDmsObjects(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "linkDmsObject"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.parentDmsObjectId,
      },
      data: {
        "dmsObjectIds": params.childDmsObjectsIds
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: DvelopHttpResponse = {} as DvelopHttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const linkDmsObjects = _linkDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
    await linkDmsObjects(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});
