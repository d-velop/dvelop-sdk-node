import axios, { AxiosResponse } from "axios";
import { TenantContext, BadRequestError, UnauthorizedError } from "../../index";

export interface CreateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;

  /** ID of the source. See Mapping for more information. */
  sourceId: string;


  /** ID of the category for the DmsObject */
  categoryId: string;
}

/**
 * Create a DmsObject in the DMS-App.
 *
 * @param context {@link TenantContext}-object containing systemBaseUri and a valid authSessionId
 * @param params {@link CreateDmsObjectParams}-object.
 *
 * @throws {@link BadRequestError} indicates invalid method params. See the ```err.requestError.response.data```-propterty for more information.
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams): Promise<void>;

/**
 * An additional transform-function can be supplied. Check out the docs for more information.
 *
 * @param transform Transformer for the {@link AxiosResponse}
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function createDmsObject<T>(context: TenantContext, params: CreateDmsObjectParams, transform: (response: AxiosResponse<void>)=> T): Promise<T>;
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams, transform: (response: AxiosResponse<void>)=> any = (_) => { }): Promise<any> {

  try {
    const response: AxiosResponse<void> = await axios.post<void>(`/dms/r/${params.repositoryId}/o2m`, {
      sourceId: params.sourceId,
      sourceCategory: params.categoryId
    }, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      }
    });

    return transform(response);
  } catch (e) {

    const errorContext: string = "Failed to create dmsObject";

    if (axios.isAxiosError(e))
      switch (e.response?.status) {
      case 400:
        throw new BadRequestError(errorContext, e);

      case 401:
        throw new UnauthorizedError(errorContext, e);
      }

    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}