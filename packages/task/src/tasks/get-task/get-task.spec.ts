import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { GetTaskParams, Task, _getTaskDefaultTransformFunction, _getTaskFactory } from "./get-task";

describe("getTaskFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetTaskParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      location: "HiItsMeLocation"
    };
  });

  it("should make correct request", async () => {

    const getTask = _getTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await getTask(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: params.location
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getTask = _getTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await getTask(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getTaskDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        "subject": "HiItsMeSubject",
        "assignedUsers": [
          "HiItsMeAssignedUser1",
          "HiItsMeAssignedUser2"
        ],
        "assignedGroups": ["HiItsMeAssignedGroup"],
        "deputies": ["HiItsMeDeputy"],
        "senderLabel": "HiItsMeSenderLaber",
        "sender": "HiItsMeSender",
        "receiveDate": "HiItsMeReceiveDate",
        "priority": 42,
        "id": "HiItsMeId",
        "completed": true,
        "context": {
          "type": "HiItsMeContextType",
          "name": "HiItsMeCOntextName"
        },
        "editor": "HiItsMeEditor",
        "editorLabel": "HiItsMeEditorLabel",
        "correlationKey": "HiItsMeCorrelationKey",
        "readByCurrentUser": false,
        "retentionTime": "HiItsmeRetentionTime",
        "lockHolder": "HiItsMeLockHolder",
        "dmsReferences": [
          {
            "objectId": "HiItsMeObjectId",
            "repoId": "HiItsMeRepositoryId"
          }
        ]
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getTask = _getTaskFactory(mockHttpRequestFunction, _getTaskDefaultTransformFunction);
      const result: Task = await getTask(context, params);

      expect(result).toEqual({ ...data, ...{ location: params.location } });
    });
  });
});