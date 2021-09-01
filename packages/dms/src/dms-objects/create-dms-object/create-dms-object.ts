import { DmsError } from "../../utils/errors";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { TenantContext } from "../../utils/tenant-context";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-femporarily";

const errorContext = "Failed to create dmsObject";

export interface CreateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;

  /** ID of the source. See Mapping for more information. */
  sourceId: string;


  /** ID of the category for the DmsObject */
  categoryId: string;

  /** Properties */
  properties?: {
    /** Id of the property */
    id: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[]

  /** Name of the file including its file-ending */
  fileName?: string;

  /** File can be provided as ArrayBuffer or as URL for download */
  file?: ArrayBuffer | string;
}

export type CreateDmsObjectTransformer<T> = (response: AxiosResponse<any>, context: TenantContext, params: CreateDmsObjectParams)=> T;

export function createDmsObjectDefaultTransformer(response: AxiosResponse<any>, _: TenantContext, params: CreateDmsObjectParams): GetDmsObjectParams {

  const location: string = response.headers["location"];
  const matches: RegExpExecArray | null = /^.*\/(.*?)(\?|$)/.exec(location);

  if (matches) {
    return {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: matches[1]
    };
  } else {
    throw new DmsError(errorContext, undefined, `Failed to parse dmsObjectId from '${location}'`);
  }
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
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams): Promise<GetDmsObjectParams>;

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
export async function createDmsObject<T>(context: TenantContext, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<T>): Promise<T>;
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<any> = createDmsObjectDefaultTransformer): Promise<any> {

  let contentLocationUri: string | undefined = undefined;
  if (params.file && params.file instanceof ArrayBuffer) {
    contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      file: params.file
    });
  } else {
    contentLocationUri = params.file as string;
  }

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().post<void>("/dms", {
      sourceId: params.sourceId,
      sourceCategory: params.categoryId,
      fileName: params.fileName,
      contentLocationUri: contentLocationUri
    }, {
      baseURL: context.systemBaseUri,
      follows: ["repo", "dmsobjectwithmapping"],
      templates: { "repositoryid": params.repositoryId },
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      }
    });

  } catch (e) {
    throw mapRequestError([400], errorContext, e);
  }

  return transform(response, context, params);
}