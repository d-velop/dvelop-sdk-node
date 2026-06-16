import { DvelopContext, DvelopOptions, dvelopFetch, NotFoundError } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";

/**
 * Default transform-function provided to the {@link getDmsObjectMainFile}- and {@link getDmsObjectPdfFile}-function.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<ArrayBuffer> {
  if (response.status === 404) {
    throw new NotFoundError("No File found for dmsObject.");
  }
  await ensureSuccessResponse(response);
  return await response.arrayBuffer();
}

export async function fetchDmsObjectFile<T>(
  context: DvelopContext,
  url: string,
  options?: DvelopOptions<T | ArrayBuffer>,
): Promise<T | ArrayBuffer> {
  return dvelopFetch(context, url, {
    method: "GET",
    headers: { "Accept": "application/octet-stream" }
  }, options ?? { onResponse });
}

async function getDmsObjectLinkHref(
  context: DvelopContext,
  params: GetDmsObjectParams,
  linkName: string,
  initOverwrite?: RequestInit,
): Promise<string | undefined> {
  return dvelopFetch(
    context,
    `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}?sourceid=${params.sourceId}`,
    { method: "GET" },
    {
      initOverwrite,
      onResponse: async (response: Response) => {
        await ensureSuccessResponse(response);
        const data: any = await response.json();
        return data._links?.[linkName]?.href as string | undefined;
      }
    }
  );
}

/**
 * Download a DmsObject-file.
 *
 * ```typescript
 * import { getDmsObjectMainFile } from "@dvelop-sdk/dms";
 * import { writeFileSync } from "fs";
 *
 * const file: ArrayBuffer = await getDmsObjectMainFile({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 * });
 *
 * writeFileSync(`${__dirname}/our-profits.kaching`, Buffer.from(file)); // only node.js
 * ```
 * @category DmsObject
 */
export async function getDmsObjectMainFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectMainFile<T>(context: DvelopContext, params: GetDmsObjectParams, options: DvelopOptions<T>): Promise<T>;
export async function getDmsObjectMainFile<T>(
  context: DvelopContext,
  params: GetDmsObjectParams,
  options?: DvelopOptions<T | ArrayBuffer>,
): Promise<T | ArrayBuffer> {
  let href: string | undefined;
  try {
    href = await getDmsObjectLinkHref(context, params, "mainblobcontent", options?.initOverwrite);
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      throw new NotFoundError(`No main file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
    }
    throw e;
  }
  if (!href) {
    throw new NotFoundError(`No main file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
  }
  try {
    return await fetchDmsObjectFile<T>(context, href, options);
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      throw new NotFoundError(`No main file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
    }
    throw e;
  }
}

/**
 * Download a DmsObject-file as PDF.
 *
 * ```typescript
 * import { getDmsObjectPdfFile } from "@dvelop-sdk/dms";
 * import { writeFileSync } from "fs";
 *
 * const file: ArrayBuffer = await getDmsObjectPdfFile({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 * });
 *
 * writeFileSync(`${__dirname}/our-profits.pdf`, Buffer.from(file)); // only node.js
 * ```
 * @category DmsObject
 */
export async function getDmsObjectPdfFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectPdfFile<T>(context: DvelopContext, params: GetDmsObjectParams, options: DvelopOptions<T>): Promise<T>;
export async function getDmsObjectPdfFile<T>(
  context: DvelopContext,
  params: GetDmsObjectParams,
  options?: DvelopOptions<T | ArrayBuffer>,
): Promise<T | ArrayBuffer> {
  let href: string | undefined;
  try {
    href = await getDmsObjectLinkHref(context, params, "pdfblobcontent", options?.initOverwrite);
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      throw new NotFoundError(`No PDF file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
    }
    throw e;
  }
  if (!href) {
    throw new NotFoundError(`No PDF file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
  }
  try {
    return await fetchDmsObjectFile<T>(context, href, options);
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      throw new NotFoundError(`No PDF file found for dmsObject '${params.dmsObjectId}' in repository '${params.repositoryId}'.`);
    }
    throw e;
  }
}
