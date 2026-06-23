import { DvelopContext } from "../context/context.js";
import { generateRequestId } from "../generate-uuid/generate-uudi-id.js";
import { DvelopOptions } from "../options/options.js";
import { buildTraceparentHeader } from "../trace-context/traceparent-header/traceparent-header.js";
import { deepMergeObjects } from "../util/deep-merge-objects.js";

export async function dvelopFetch(context: DvelopContext, path: string, init: RequestInit): Promise<Response>;
export async function dvelopFetch<T>(context: DvelopContext, path: string, init: RequestInit, options: DvelopOptions<T>): Promise<T>;
export async function dvelopFetch<T>(
  context: DvelopContext,
  path: string,
  init: RequestInit,
  options?: DvelopOptions<T>
): Promise<T | Response> {

  const defaultInit: Partial<RequestInit> = {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/hal+json, application/json",
      "Authorization": `Bearer ${context.authSessionId}`,
      "x-dv-request-id": context.requestId ?? generateRequestId(),
      "traceparent": context.traceContext ? buildTraceparentHeader(context.traceContext) : ""
    }
  };

  const finalInit = deepMergeObjects<Partial<RequestInit>>(defaultInit, init, options?.initOverwrite ?? {});
  const response = await fetch(`${context.systemBaseUri}${path}`, finalInit);
  return (options?.onResponse) ? await options.onResponse(response) : response;
};