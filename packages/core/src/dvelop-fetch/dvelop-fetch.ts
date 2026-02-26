import { DvelopContext } from "../context/context";
import { generateRequestId } from "../generate-uuid/generate-uudi-id";
import { buildTraceparentHeader } from "../trace-context/traceparent-header/traceparent-header";
import { deepMergeObjects } from "../util/deep-merge-objects";

export async function dvelopFetch(context: DvelopContext, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {

  const defaultInit: RequestInit = {};

  defaultInit.headers = {
    "ContentType": "application/json",
    "Accept": "application/hal+json, application/json",
    "x-dv-request-id": context.requestId || generateRequestId()
  };

  if (context.authSessionId) {
    defaultInit.headers["Authorization"] = `Bearer ${context.authSessionId}`;
  }

  if (context.traceContext) {
    defaultInit.headers["traceparent"] = buildTraceparentHeader(context.traceContext);
  }

  const fetchInput: RequestInfo | URL = (context.systemBaseUri || "") + input
  const fetchInit: RequestInit = deepMergeObjects(defaultInit, init || {})

  return fetch(fetchInput, fetchInit)
}