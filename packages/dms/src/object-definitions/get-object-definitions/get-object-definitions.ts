import {_defaultHttpRequestFunction, HttpConfig, HttpResponse} from "../../utils/http";
import {DvelopContext} from "@dvelop-sdk/core";

export interface ObjectDefinition {
  /** ID of the object definition */
  id: string;
  /** UUID of the object definition */
  uniqueId?: string;
  /** Display name of the object definition */
  displayName: string;
  writeAccess: boolean;
  objectType: number;
  propertyFields: {
    id: string;
    /** UUID of the property */
    uniqueId: string;
    /** Display name of the property */
    displayName: string;
    dataType: number;
    searchable: boolean;
    canSortValues: boolean;
    canFacetValues: boolean;
    isMandatory: boolean;
    hasValueList: boolean;
    isList: boolean;
    visibleStore: boolean;
    visibleResultList: boolean;
    isModifiable: boolean;
    isSystemProperty: boolean;
    docFieldId: number;
    maxLength: number;
  }[];
}

export interface GetObjectDefinitionsParams {
  /** Id of the repository */
  repositoryId: string;
}

export function _getObjectDefinitionsDefaultTransformFunction(response: HttpResponse, _: DvelopContext): ObjectDefinition[] {
  return response.data.objectDefinitions.map((dto: any) => {
    return {
      id: dto.id,
      uniqueId: dto?.uniqueId,
      displayName: dto.displayName,
      writeAccess: dto.writeAccess,
      objectType: dto.objectType,
      propertyFields: dto.propertyFields,
    };
  });
}

export function _getObjectDefinitionsFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext) => T,
): (context: DvelopContext, params: GetObjectDefinitionsParams) => Promise<T> {
  return async (context: DvelopContext, params: GetObjectDefinitionsParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "allobjdefs"],
      templates: {
        "repositoryid": params.repositoryId,
      },
    });

    return transformFunction(response, context);
  };
}

export async function getObjectDefinitions(context: DvelopContext, params: GetObjectDefinitionsParams): Promise<ObjectDefinition[]> {
  return await _getObjectDefinitionsFactory(_defaultHttpRequestFunction, _getObjectDefinitionsDefaultTransformFunction)(context, params);
}
