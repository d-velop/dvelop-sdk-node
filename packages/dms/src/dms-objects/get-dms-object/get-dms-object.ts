import axios, { AxiosResponse } from "axios";
import { TenantContext, BadRequestError, UnauthorizedError, NotFoundError, internals } from "../../index";

export interface GetDmsObjectParams {
  repositoryId: string;
  sourceId: string;
  dmsObjectId: string;
}

export interface GetDmsObjectDto {
  id: string;
  sourceProperties: {
    key: string;
    value: string;
    values?: any;
    displayValue?: string;
  }[];
  sourceCategories: string[];
  _links: internals.HalJsonLinks
}

export interface DmsObject {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
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

export function transformGetDmsObjectDto(response: AxiosResponse<GetDmsObjectDto>): DmsObject {
  return {
    repositoryId: response.config.params.repositoryid,
    sourceId: response.config.params.sourceid,
    id: response.data.id,
    categories: response.data.sourceCategories,
    properties: response.data.sourceProperties
  };
}

/**
 * Get a DmsObject from a repository of the DMS-App.
 *
 * @param context {@link TenantContext}-object containing systemBaseUri and a valid authSessionId.
 * @param params {@link GetDmsObjectParams}-object containing repositoryId, sourceId and dmsObjectId.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function getDmsObject(context: TenantContext, params: GetDmsObjectParams): Promise<DmsObject>

/**
 * An additional transform-function can be supplied. Check out the docs for more information.
 *
 * @param transform Transformer for the {@link AxiosResponse}.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function getDmsObject<T>(context: TenantContext, params: GetDmsObjectParams, transform: (response: AxiosResponse<GetDmsObjectDto>)=> T): Promise<T>
export async function getDmsObject(context: TenantContext, params: GetDmsObjectParams, transform: (response: AxiosResponse<GetDmsObjectDto>)=> any = transformGetDmsObjectDto): Promise<any> {

  try {
    const response: AxiosResponse<GetDmsObjectDto> = await axios.get<GetDmsObjectDto>("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        Accept: "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });

    return transform(response);
  } catch (e) {

    const errorContext = "Failed to get dmsObject";

    if (axios.isAxiosError(e))
      switch (e.response?.status) {
      case 400:
        throw new BadRequestError(errorContext, e);

      case 401:
        throw new UnauthorizedError(errorContext, e);

      case 404:
        throw new NotFoundError(errorContext, e);
      }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}