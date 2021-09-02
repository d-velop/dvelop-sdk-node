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
    key: string,
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
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams): Promise<GetDmsObjectParams>;

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
export async function createDmsObject<T>(context: TenantContext, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<T>): Promise<T>;
export async function createDmsObject(context: TenantContext, params: CreateDmsObjectParams, transform: CreateDmsObjectTransformer<any> = createDmsObjectDefaultTransformer): Promise<any> {

  let data: any = {
    sourceId: params.sourceId,
    sourceCategory: params.categoryId,

  };

  if (params.properties && params.properties.length > 0) {
    data.sourceProperties = {
      properties: params.properties
    };
  }

  if (params.file && params.file instanceof ArrayBuffer) {
    data.fileName = params.fileName;
    data.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      file: params.file
    });
  } else if (params.file && typeof params.file === "string") {
    data.fileName = params.fileName;
    data.contentLocationUri = params.file;
  }

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().post<void>("/dms", data, {
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