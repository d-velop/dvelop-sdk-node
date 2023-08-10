import {DvelopContext} from "@dvelop-sdk/core";
import {
  _getObjectDefinitionsDefaultTransformFunction,
  _getObjectDefinitionsFactory,
  GetObjectDefinitionsParams, ObjectDefinition
} from "./get-object-definitions";
import {HttpResponse} from "../../utils/http";

describe("getObjectDefinitions", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetObjectDefinitionsParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
    };

    params = {
      repositoryId: "MyRepositoryId",
    };
  });

  it("should make correct request", async () => {
    const getObjectDefinitions = _getObjectDefinitionsFactory(mockHttpRequestFunction, mockTransformFunction);
    await getObjectDefinitions(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "allobjdefs"],
      templates: {
        "repositoryid": params.repositoryId,
      },
    });


  });
  it("should pass response to transform and return transform-result", async () => {
    const response: HttpResponse = {
      data: {test: "TestValue"},
    } as HttpResponse;
    const transformResult: any = {
      result: "ResultValue",
    };

    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getObjectDefinitions = _getObjectDefinitionsFactory(mockHttpRequestFunction, mockTransformFunction);
    const result = await getObjectDefinitions(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
    expect(result).toEqual(transformResult);
  });

  describe("getObjectDefinitionsDefaultTransformFunction", () => {
    it("should map correctly", async () => {
      const data: any = {
        objectDefinitions: [
          {
            id: "TestType1",
            uniqueId: "unique-id-1",
            displayName: "My Test Object 1",
            writeAccess: false,
            objectType: 0,
            propertyFields: []
          },
          {
            id: "TestType2",
            uniqueId: "unique-id-2",
            displayName: "My Test Object 3",
            writeAccess: true,
            objectType: 0,
            propertyFields: [
              {
                id: "propertyId1",
                uniqueId: "unique-id-3",
                displayName: "My Property 1",
                dataType: 0,
                searchable: false,
                canSortValues: true,
                canFacetValues: false,
                isMandatory: true,
                hasValueList: false,
                isList: false,
                visibleStore: false,
                visibleResultlist: false,
                isModifiable: true,
                isSystemProperty: false,
                docFieldId: 1,
                maxFieldLength: 35,
              },
            ]
          },
        ],
      };

      mockHttpRequestFunction.mockResolvedValue({data} as HttpResponse);

      const getObjectDefinitions = _getObjectDefinitionsFactory(mockHttpRequestFunction, _getObjectDefinitionsDefaultTransformFunction);
      const result: ObjectDefinition[] = await getObjectDefinitions(context, params);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("id", "TestType1");
      expect(result[1].propertyFields).toHaveLength(1);
      expect(result[1]).toHaveProperty("propertyFields[0].id", "propertyId1");
    });
  });
});
