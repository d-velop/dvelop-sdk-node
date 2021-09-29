import { DmsError } from "../../utils/errors";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
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
    key: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[]

  /** Name of the file including its file-ending */
  fileName?: string;

  /** URL from which file can be downloaded. Has to be a relative URL reachable within the tenant */
  contentUri?: string,

  /** URL at which the file is temporarily stored in the DMS-App. See ... for more information.  */
  contentLocationUri?: string

  /** File for the DmsObject. This will use the {@link storeFileTemporarily}-function and overwrite ```contentLocationUri```-property. */
  content?: ArrayBuffer,
}

export type CreateDmsObjectTransformer<T> = (response: AxiosResponse<any>, context: Context, params: CreateDmsObjectParams)=> T;

export function createDmsObjectDefaultTransformer(response: AxiosResponse<any>, _: Context, params: CreateDmsObjectParams): GetDmsObjectParams {

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
 * @param context {@link Context}-object containing systemBaseUri and a valid authSessionId
 * @param params {@link CreateDmsObjectParams}-object.
 *
 * @throws {@link BadInputError} indicates invalid method params.
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * // nodejs
 * import { readFileSync } from "fs";
 *
 * const file: ArrayBuffer = readFileSync(`${__dirname}/chicken.pdf`).buffer;
 * const dmsObject: GetDmsObjectParams = await createDmsObject(context, {
 *   repositoryId: repoId,
 *   categoryId: "3ed080ff-ca5f-4248-a0e9-8234ba3abe11",
 *   sourceId: `/dms/r/${repoId}/source`,
 *   fileName: 'chicken.pdf',
 *   file: file
 * });
 * ```
 */
export async function createDmsObject(context: Context, params: CreateDmsObjectParams): Promise<GetDmsObjectParams>;

/**
 * An additional transform-function can be supplied. Check out the docs for more information.
 * @param transform {@link CreateDmsObjectTransformer} Transformer for the {@link AxiosResponse}
 * @category DmsObjects
 *
 * @example ```typescript
 * const rawResponse: any = await createDmsObject(context, params, (res: AxiosResponse<any>) => res);
 * console.log(rawResponse.headers["location"]);
 * ```
 */
export async function createDmsObject<T>(context: Context, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<T>): Promise<T>;
export async function createDmsObject(context: Context, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<any> = createDmsObjectDefaultTransformer): Promise<any> {

  if (params.content && !params.contentLocationUri) {
    params.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      file: params.content
    });
  }

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().post<void>("/dms", {
      sourceId: params.sourceId,
      sourceCategory: params.categoryId,
      sourceProperties: {
        properties: params.properties
      },
      fileName: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
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

  } catch (e: any) {
    throw mapRequestError([400], errorContext, e);
  }

  return transform(response, context, params);
}