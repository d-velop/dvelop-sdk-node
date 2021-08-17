import axios, { AxiosResponse } from "axios";
import { TenantContext, BadRequestError, UnauthorizedError, NotFoundError } from "../../index";

export interface UpdateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Short description of changes */
  alterationText: string;
  /** Property-Updates - Only listed properties will be changed */
  properties?: {
    /** Id of the property */
    id: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[];
}

/**
 * Update a DmsObject in the DMS-App.
 *
 * @param context {@link TenantContext}-object containing systemBaseUri and a valid authSessionId
 * @param params {@link UpdateDmsObjectParams}-object.
 *
 * @throws {@link BadRequestError} indicates invalid method params. See the ```err.requestError.response.data```-propterty for more information.
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 * @throws {@link NotFOundError} indicates an invalid combination of repositoryId, sourceId and dmsObjectId
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function updateDmsObject(context: TenantContext, params: UpdateDmsObjectParams): Promise<void>;

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
export async function updateDmsObject<T>(context: TenantContext, params: UpdateDmsObjectParams, transform: (response: AxiosResponse)=> T): Promise<T>;
export async function updateDmsObject(context: TenantContext, params: UpdateDmsObjectParams, transform: (response: AxiosResponse)=> any = () => { }): Promise<any> {

  try {
    const response: AxiosResponse<void> = await axios.put<void>("/dms", {
      sourceId: params.sourceId,
      alterationText: params.alterationText,
      sourceProperties: { properties: params.properties }
    }, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });

    return transform(response);
  } catch (e) {

    const errorContext: string = "Failed to update dmsObject";

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