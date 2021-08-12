import axios, { AxiosResponse } from "axios";
import { DmsAppBadRequestError, DmsObjectNotFoundError } from "../../index";

export interface UpdateDmsObjectParams {
  repositoryId: string;
  dmsObjectId: string;
  sourceId: string;
  alterationText: string;
  category?: string;
  properties?: {
    key: string;
    values: string[];
  }[];
  fileName?: string;
  fileLocation?: string;
}

export type UpdateDmsObjectTransformFunction<T> = (response: AxiosResponse<void>, systemBaseUri: string, authSessionId: string, params: UpdateDmsObjectParams)=> T;

export async function updateDmsObject(systemBaseUri: string, authSessionId: string, params: UpdateDmsObjectParams): Promise<void>;
export async function updateDmsObject<T>(systemBaseUri: string, authSessionId: string, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformFunction<T>): Promise<T>;
export async function updateDmsObject(systemBaseUri: string, authSessionId: string, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformFunction<any> = () => { }): Promise<any> {

  try {
    const response: AxiosResponse<void> = await axios.put<void>("/dms", {
      sourceId: params.sourceId,
      alterationText: params.alterationText,
      sourceCategory: params.category,
      sourceProperties: {
        properties: params.properties
      }
    }, {
      baseURL: systemBaseUri,
      headers: {
        Authorization: `Bearer ${authSessionId}`,
        Accept: "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        repositoryid: params.repositoryId,
        dmsobjectid: params.dmsObjectId,
        sourceid: params.sourceId
      }
    });

    return transform(response, systemBaseUri, authSessionId, params);
  } catch (e) {

    const errorContext = "Failed to update DmsObject";

    if (axios.isAxiosError(e) || e.response) {
      switch (e.response.status) {
      case 400:
        throw new DmsAppBadRequestError(errorContext, e);
      case 404:
        throw new DmsObjectNotFoundError(errorContext, e);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }

}