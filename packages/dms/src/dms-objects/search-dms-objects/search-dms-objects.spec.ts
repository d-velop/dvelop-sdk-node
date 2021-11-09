import { DvelopContext } from "../../index";
import { HttpResponse } from "../../utils/http";
import { _searchDmsObjectsDefaultTransformFunctionFactory, searchDmsObjectsFactory, SearchDmsObjectsParams, SearchDmsObjectsResultPage } from "./search-dms-objects";

describe("searchDmsObjects", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: SearchDmsObjectsParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId"
    };
  });

  [
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId"
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId"
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        categories: ["HiItsMeCategory1", "HiItsMeCategory2"]
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "sourcecategories": ["HiItsMeCategory1", "HiItsMeCategory2"],
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        properties: [

          {
            key: "HiItsMeProperty1",
            values: ["HiItsMeProperty1Value1"]
          }, {
            key: "HiItsMeProperty2",
            values: ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"]
          }
        ]
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "sourceproperties": {
          "HiItsMeProperty1": ["HiItsMeProperty1Value1"],
          "HiItsMeProperty2": ["HiItsMeProperty2Value1", "HiItsMeProperty2Value2"]
        }
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        properties: [

          {
            key: "HiItsMeProperty1",
            values: ["HiItsMeProperty1Value1"]
          }, {
            key: "HiItsMeProperty1",
            values: ["HiItsMeProperty1Value2", "HiItsMeProperty1Value3"]
          }
        ]
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "sourceproperties": {
          "HiItsMeProperty1": ["HiItsMeProperty1Value1", "HiItsMeProperty1Value2", "HiItsMeProperty1Value3"]
        }
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        sortProperty: "HiItsMeSortProperty"
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "sourcepropertysort": "HiItsMeSortProperty",
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        ascending: true
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "ascending": true,
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        fulltext: "Hi Its Me Fulltext"
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "fulltext": "Hi Its Me Fulltext",
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        page: 42
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "page": 42,
      }
    },
    {
      params: {
        repositoryId: "HiItsMeRepositoryId",
        sourceId: "HiItsMeSourceId",
        pageSize: 42
      }, expectedTemplates: {
        "repositoryid": "HiItsMeRepositoryId",
        "sourceid": "HiItsMeSourceId",
        "pagesize": 42,
      }
    }
  ].forEach(testCase => {
    it(`should make correct request for params: ${JSON.stringify(testCase.params)}`, async () => {

      const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
      await searchDmsObjects(context, testCase.params);

      expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: "/dms",
        follows: ["repo", "searchresultwithmapping"],
        templates: testCase.expectedTemplates
      });
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, mockTransformFunction);
    await searchDmsObjects(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getDmsObjectDefaultTransformFunction", () => {

    it("should set page", async () => {

      const data: any = {
        "page": 3,
        "items": []
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: SearchDmsObjectsResultPage = await searchDmsObjects(context, params);

      expect(result).toHaveProperty("page", 3);
      expect(result).not.toHaveProperty("getPreviousPage");
      expect(result).not.toHaveProperty("getNextPage");
    });

    describe("items", () => {
      it("should transform items", async () => {

        const data: any = {
          "page": 3,
          "items": [{
            "id": "HiItsMeDmsObjectId1",
            "sourceProperties": [
              {
                "key": "HiItsMeProperty1Key",
                "value": "HiItsMeProperty1Value",
                "isMultiValue": false
              },
              {
                "key": "HiItsMeProperty2Key",
                "value": "HiItsMeProperty2Value",
                "isMultiValue": true,
                "values": {
                  "1": "HiItsMeProperty2Value1",
                  "2": "HiItsMeProperty2Value2",
                }
              }
            ],
            "sourceCategories": [
              "HiItsMeCategory1",
              "HiItsMeCategory2"
            ]
          },
          {
            "id": "HiItsMeDmsObjectId2",
            "sourceProperties": [
            ],
            "sourceCategories": ["HiItsMeCategory1"]
          }
          ]
        };

        const response: HttpResponse = { data: data } as HttpResponse;
        mockHttpRequestFunction.mockResolvedValue(response);

        const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(mockHttpRequestFunction));
        const result: SearchDmsObjectsResultPage = await searchDmsObjects(context, params);

        expect(result.dmsObjects.length).toBe(2);
        expect(result.dmsObjects[0]).toHaveProperty("repositoryId", params.repositoryId);
        expect(result.dmsObjects[0]).toHaveProperty("sourceId", params.sourceId);
        expect(result.dmsObjects[0]).toHaveProperty("dmsObjectId", data.items[0].id);
        expect(result.dmsObjects[0]).toHaveProperty("properties", data.items[0].sourceProperties);
        expect(result.dmsObjects[0]).toHaveProperty("categories", data.items[0].sourceCategories);

        expect(result.dmsObjects[1]).toHaveProperty("repositoryId", params.repositoryId);
        expect(result.dmsObjects[1]).toHaveProperty("sourceId", params.sourceId);
        expect(result.dmsObjects[1]).toHaveProperty("dmsObjectId", data.items[1].id);
        expect(result.dmsObjects[1]).toHaveProperty("categories", data.items[1].sourceCategories);


        expect(result.dmsObjects[0]).not.toHaveProperty("getMainFile");
        expect(result.dmsObjects[1]).not.toHaveProperty("getMainFile");
      });

      it("should set getMainFile Function", async () => {

        const data: any = {
          "page": 3,
          "items": [{
            "_links": {
              "mainblobcontent": {
                "href": "HiItsMeMainBlobContentHref"
              }
            },
            "id": "HiItsMeDmsObjectId1",
            "sourceProperties": [
            ],
            "sourceCategories": ["HiItsMeCategory1",]
          }]
        };

        const response: HttpResponse = { data: data } as HttpResponse;
        mockHttpRequestFunction.mockResolvedValue(response);

        const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(mockHttpRequestFunction));
        const result: SearchDmsObjectsResultPage = await searchDmsObjects(context, params);

        expect(result.dmsObjects[0]).toHaveProperty("getMainFile");

        const file: ArrayBuffer = new ArrayBuffer(42);
        mockHttpRequestFunction.mockResolvedValue({ data: file });
        const fileResult: ArrayBuffer = await result.dmsObjects[0].getMainFile();

        expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
          method: "GET",
          url: "HiItsMeMainBlobContentHref",
          headers: { "Accept": "application/octet-stream" },
          responseType: "arraybuffer"
        });
        expect(fileResult).toEqual(file);
      });
    });

    it("should set getPreviousPage", async () => {

      const data: any = {
        "_links": {
          "prev": {
            "href": "HiItsMePreviousHref"
          }
        },
        "page": 3,
        "items": []
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: SearchDmsObjectsResultPage = await searchDmsObjects(context, params);

      expect(result).toHaveProperty("getPreviousPage");

      const prevData: any = {
        "_links": {},
        "page": 2,
        "items": []
      };

      mockHttpRequestFunction.mockResolvedValue({ data: prevData });
      const prevResult: SearchDmsObjectsResultPage = await result.getPreviousPage();

      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: data._links.prev.href
      });
      expect(prevResult).toHaveProperty("page", 2);
      expect(prevResult).toHaveProperty("dmsObjects", []);
      expect(prevResult).not.toHaveProperty("getPreviousPage");
    });

    it("should set getNextPage", async () => {

      const data: any = {
        "_links": {
          "next": {
            "href": "HiItsMeNextHref"
          }
        },
        "page": 3,
        "items": []
      };

      const response: HttpResponse = { data: data } as HttpResponse;
      mockHttpRequestFunction.mockResolvedValue(response);

      const searchDmsObjects = searchDmsObjectsFactory(mockHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(mockHttpRequestFunction));
      const result: SearchDmsObjectsResultPage = await searchDmsObjects(context, params);

      expect(result).toHaveProperty("getNextPage");

      const nextData: any = {
        "_links": {},
        "page": 2,
        "items": []
      };

      mockHttpRequestFunction.mockResolvedValue({ data: nextData });
      const nextResult: SearchDmsObjectsResultPage = await result.getNextPage();

      expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
        method: "GET",
        url: data._links.next.href
      });
      expect(nextResult).toHaveProperty("page", 2);
      expect(nextResult).toHaveProperty("dmsObjects", []);
      expect(nextResult).not.toHaveProperty("getNextPage");
    });
  });
});