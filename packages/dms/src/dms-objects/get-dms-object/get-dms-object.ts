import axios, { AxiosResponse } from "axios";
import { DmsAppBadRequestError, DmsObjectNotFoundError, _internals } from "../../index";

/**
 * Paramerters for getDmsObject-method.
 * @category DmsObjects
 */
export interface GetDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** ID of the source. See ... */
  sourceId: string;
}

/** @category Internals */
export interface DmsObjectWithMappingDto {
  id: string;
  sourceProperties: {
    key: string;
    value: string;
    values?: any;
    displayValue?: string;
  }[];
  sourceCategories: string[];
  _links: _internals.HalJsonLinks;
}

/**
 * DmsObject from the DMS-App.
 * @category DmsObjects
 */
export interface DmsObject {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject */
  id: string;
  /** Category of the DmsObject */
  categories: string[];
  /** Properties of the DmsObject */
  properties: {
    /** Key of the DmsObject-Property */
    key: string;
    /** Value of the DmsObject-Property */
    value: string;
    /** Values of the DmsObject-Property */
    values?: any;
    /** Display-Value of the DmsObject-Property */
    displayValue?: string;
  }[]
}

export type GetDmsObjectTransformFunction<T> = (
  response: AxiosResponse<DmsObjectWithMappingDto>,
  systemBaseUri: string,
  authSessionId: string,
  params: GetDmsObjectParams
)=> T;

export function transformGetDmsObjectResponseToDmsObject(response: AxiosResponse<DmsObjectWithMappingDto>,
  _: string,
  __: string,
  params: GetDmsObjectParams): DmsObject {
  return {
    repositoryId: params.repositoryId,
    id: response.data.id,
    categories: response.data.sourceCategories,
    properties: response.data.sourceProperties
  };
}

/**
 * Get a DmsObject from a repository of the DMS-App.
 * @param systemBaseUri SystemBaseUri for the tenant
 * @param authSessionId Valid AuthSessionId
 * @param params Parameters for getting the DmsObject: see {@link GetDmsObjectParams}
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * const dmsObj: DmsObject = await getDmsObject("https://steamwheedle-cartel.d-velop.cloud", "dQw4w9WgXcQ", {
 *   repositoryId: "21",
 *   dmsObjectId: "UT0000001";
 *   sourceId: "/dms/r/21/source";
 * });
 * console.log(dmsObj.categories[0]); // Bribery Contracts
 * ```
 */
export async function getDmsObject(systemBaseUri: string, authSessionId: string, params: GetDmsObjectParams): Promise<DmsObject>;
/**
 * Provides access to the original API-DTO. See ...
 * @param transform Transform-function that takes a {@link DmsObjectWithMappingDto}.
 *
 * @example ```typescript
 * const originalDto: DmsObjectWithMappingDto = await getDmsObject<DmsObjectWithMappingDto>(systemBaseUri, authSessionId, params, (dto: DmsObjectWithMappingDto) => dto);
 * ```
 */
export async function getDmsObject<T>(systemBaseUri: string, authSessionId: string, params: GetDmsObjectParams, transform: GetDmsObjectTransformFunction<T>): Promise<T>;
export async function getDmsObject(systemBaseUri: string, authSessionId: string, params: GetDmsObjectParams, transform: GetDmsObjectTransformFunction<any> = transformGetDmsObjectResponseToDmsObject): Promise<any> {

  try {
    const response: AxiosResponse<DmsObjectWithMappingDto> = await axios.get<DmsObjectWithMappingDto>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        Accept: "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });

    return transform(response, systemBaseUri, authSessionId, params);
  } catch (e) {

    const errorContext = "Failed to get DmsObject";

    if (axios.isAxiosError(e) || e.response) {
      switch (e.response.status) {
      case 400:
        throw new DmsAppBadRequestError(errorContext, e);
        // TODO: 401
      case 404:
        throw new DmsObjectNotFoundError(errorContext, e);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}
