Axios needs to be removed from dependencies entirly. Instead we want to build on nodes build-in fetch method. Assume that globally known types from fetch like Response and Requests are knwon and do not need any abstraction. With this, we do not need hal json anymore and will just use static URLs. We also want to redesign this sdk to modernize it. The current state is documented in the README.md. Be sure to check the Advanced topic. It turns out this part especialle is to complicated for users. So we want to keep the "simple" method structure of

doSomething(context: DvelopContext, params: MethodParams): T {}

but i want a better way for users to
- manipulate the requestparams (e.g. they need to dispable https-certification, longer timeouts, retries etc.)
- manipulate the raw json response

Users of this sdk are typically consultants who don't even work with typescript since it's too complex. Make a plan for a new Structure for methods (while the simple signatures stay the same) and how to implement this new https method. Use factory-patterns where you see fit but do not enforce them.

Context

 The SDK currently wraps axios in a complex factory-injection pattern (_getRepositoryFactory(httpFn, transformFn)) that was designed for testability and advanced extensibility.
 Non-TypeScript consultant users find it impossible to use — they just want to set a timeout or see the raw response, but doing so requires understanding TypeScript generics,
 factory functions, and the axios config shape.

 Additionally:
 - DvelopHttpRequestConfig extends AxiosRequestConfig leaks the axios API surface
 - HAL-JSON following (follows: ["repo", "dmsobjectwithmapping"]) adds hidden network hops and complexity
 - Static URLs are known and stable; HAL discovery is unnecessary overhead
 - Every method call creates a new DvelopHttpClient via defaultDvelopHttpClientFactory() (wasteful)

 Goal: Keep doSomething(context, params) for simple use, but replace the factory extension point with a plain options third parameter that any JS user can understand.

 ---
 New Method Signature

 All SDK methods gain an optional third parameter:

 doSomething(context: DvelopContext, params: MethodParams, options?: DvelopRequestOptions): Promise<T>

 This is backward compatible — existing code that omits options keeps working unchanged.

 ---
 DvelopRequestOptions (exported from @dvelop-sdk/core)

 export interface DvelopRequestOptions {
   /** Replace the built-in fetch. Use for custom TLS, retries, proxies. */
   fetch?: typeof globalThis.fetch;

   /** Extra headers merged on top of the SDK defaults. */
   headers?: Record<string, string>;

   /** Cancellation / timeout signal. Example: AbortSignal.timeout(10_000) */
   signal?: AbortSignal;

   /**
    * Called with a clone of the raw Response before the default JSON transform.
    * Return a value to replace the method's return. Return undefined (or nothing)
    * to let the default transform run.
    */
   onResponse?: (response: Response) => unknown | Promise<unknown>;
 }

 Usage examples (plain JavaScript)

 // Timeout
 const repo = await getRepository(context, params, {
   signal: AbortSignal.timeout(5000)
 });
 // Disable TLS (Node 18+ via custom undici dispatcher)
 import { Agent } from "undici";
 const insecureFetch = (url, init) =>
   fetch(url, { ...init, dispatcher: new Agent({ connect: { rejectUnauthorized: false } }) });

 const repo = await getRepository(context, params, { fetch: insecureFetch });

 // Retry wrapper
 import { fetchWithRetry } from "fetch-retry"; // any retry lib
 const repo = await getRepository(context, params, { fetch: fetchWithRetry(fetch) });

 // Access raw JSON response
 const raw = await getRepository(context, params, {
   onResponse: async (response) => response.json()  // bypasses default transform
 });

 // Log a header without replacing the result
 const repo = await getRepository(context, params, {
   onResponse: (response) => {
     console.log("ETag:", response.headers.get("etag"));
     // returns undefined → default transform still runs
   }
 });

 ---
 @dvelop-sdk/core changes

 New dvelopFetch function (packages/core/src/http/fetch.ts)

 export async function dvelopFetch(
   context: DvelopContext,
   path: string,
   init: RequestInit,
   options?: DvelopRequestOptions
 ): Promise<Response> {
   const headers = new Headers(init.headers);
   headers.set("Accept", "application/json");
   if (context.authSessionId) headers.set("Authorization", `Bearer ${context.authSessionId}`);
   headers.set(DVELOP_REQUEST_ID_HEADER, context.requestId ?? generateRequestId());
   if (context.traceContext) headers.set(TRACEPARENT_HEADER, buildTraceparentHeader(context.traceContext));
   if (options?.headers) {
     for (const [k, v] of Object.entries(options.headers)) headers.set(k, v);
   }

   const fetchFn = options?.fetch ?? globalThis.fetch;
   return fetchFn(`${context.systemBaseUri}${path}`, {
     ...init,
     headers,
     signal: options?.signal ?? init.signal,
   });
 }

 dvelopFetch returns the raw Response — it does not throw on non-2xx. Error mapping is per-package.

 Optional helper: withOptions

 export function withOptions<P, T>(
   fn: (ctx: DvelopContext, params: P, opts?: DvelopRequestOptions) => Promise<T>,
   defaults: DvelopRequestOptions
 ): (ctx: DvelopContext, params: P, opts?: DvelopRequestOptions) => Promise<T> {
   return (ctx, params, opts) => fn(ctx, params, { ...defaults, ...opts });
 }

 Lets users create pre-configured versions without TypeScript knowledge:
 const getRepoWithRetry = withOptions(getRepository, { fetch: myRetryFetch });

 Remove from core

 - packages/core/src/http/http-client.ts (DvelopHttpClient, axiosHttpClientFactory, etc.)
 - packages/core/src/http/axios-follow-hal-json.ts
 - packages/core/src/util/deep-merge-objects.ts (no longer needed)
 - axios and lodash.merge from packages/core/package.json

 Update core exports

 Export DvelopRequestOptions, dvelopFetch, withOptions. Remove all axios-related exports.

 ---
 Per-package utils/http.ts pattern

 Each package replaces its complex factory+error-mapping with a simple fetch wrapper:

 // packages/dms/src/utils/http.ts
 import { dvelopFetch, DvelopRequestOptions, DvelopContext, BadInputError, ... } from "@dvelop-sdk/core";

 export async function dmsRequest(
   context: DvelopContext,
   path: string,
   init: RequestInit,
   options?: DvelopRequestOptions
 ): Promise<Response> {
   let response: Response;
   try {
     response = await dvelopFetch(context, path, init, options);
   } catch (e: any) {
     throw new DmsError(`Request to DMS-App failed: ${e.message}`, e);
   }

   if (!response.ok) {
     let body = "";
     try { body = await response.text(); } catch { /* ignore */ }
     let parsed: any = {};
     try { parsed = JSON.parse(body); } catch { /* ignore */ }

     switch (response.status) {
       case 400: throw new BadInputError(parsed.reason ?? "Bad request");
       case 401: throw new UnauthorizedError(parsed.reason ?? "Unauthorized");
       case 403: throw new ForbiddenError(parsed.reason ?? "Forbidden");
       case 404: throw new NotFoundError(parsed.reason ?? "Not found");
       default:  throw new DmsError(`DMS-App responded with ${response.status}`);
     }
   }

   return response;
 }

 Same pattern for task, identityprovider, business-objects utils — each mapping its own error classes and status codes (e.g. task has a 429 case).

 ---
 Method implementation pattern

 // packages/dms/src/repositories/get-repository/get-repository.ts
 export async function getRepository(
   context: DvelopContext,
   params: GetRepositoryParams,
   options?: DvelopRequestOptions
 ): Promise<Repository> {
   const response = await dmsRequest(
     context,
     `/dms/r/${params.repositoryId}`,
     { method: "GET" },
     options
   );

   if (options?.onResponse) {
     const result = await options.onResponse(response.clone());
     if (result !== undefined) return result as Repository;
   }

   const data = await response.json();
   return {
     repositoryId: data.id,
     name: data.name,
     sourceId: data._links?.source?.href ?? "",
   };
 }

 Key points:
 - No factory, no transform function injection
 - Static URL replaces HAL following
 - response.clone() is passed to onResponse so the original body is still available for default transform
 - The _xFactory and _xDefaultTransformFunction internal exports are removed

 ---
 Static URL mapping

 DMS uses HAL following to discover URLs. The static equivalents (to be confirmed/discovered per-method during implementation):

 ┌────────────────────────────────────┬──────────────────────────────────┐
 │         Old (HAL follows)          │         New static path          │
 ├────────────────────────────────────┼──────────────────────────────────┤
 │ /dms → repo                        │ /dms/r/{repositoryId}            │
 ├────────────────────────────────────┼──────────────────────────────────┤
 │ /dms → repos                       │ /dms/r                           │
 ├────────────────────────────────────┼──────────────────────────────────┤
 │ /dms/r/{id} → dmsobjectwithmapping │ /dms/r/{repositoryId}/o2m        │
 ├────────────────────────────────────┼──────────────────────────────────┤
 │ /dms/r/{id} → chunkedupload        │ /dms/r/{repositoryId}/blob (TBC) │
 ├────────────────────────────────────┼──────────────────────────────────┤
 │ /dms → repo → dmsobjectsbyids      │ /dms/r/{repositoryId}/objs (TBC) │
 └────────────────────────────────────┴──────────────────────────────────┘

 ▎ Note: Static paths for DMS will be provided by the user before implementation. The task package already uses static paths (/task/tasks) and needs no URL changes.

 ---
 Test strategy

 Old tests mocked httpRequestFunction (the factory injection point). New tests inject fetch via options:

 // Old
 const fn = _getRepositoryFactory(mockHttpRequestFunction, _getRepositoryDefaultTransformFunction);
 await fn(context, params);
 expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, { method: "GET", url: "/dms", follows: [...] });

 // New
 const mockFetch = jest.fn().mockResolvedValue(new Response(JSON.stringify(mockData), { status: 200 }));
 const result = await getRepository(context, params, { fetch: mockFetch });
 expect(mockFetch).toHaveBeenCalledWith(
   "https://example.d-velop.cloud/dms/r/repo123",
   expect.objectContaining({ method: "GET" })
 );

 Tests for onResponse:
 it("should use onResponse return value when provided", async () => {
   const mockFetch = jest.fn().mockResolvedValue(new Response("{}"));
   const custom = { customField: true };
   const result = await getRepository(context, params, {
     fetch: mockFetch,
     onResponse: async () => custom,
   });
   expect(result).toBe(custom);
 });

 ---
 Files to change

 Core package (packages/core/):
 - src/http/http-client.ts → replace with src/http/fetch.ts (new dvelopFetch)
 - src/http/axios-follow-hal-json.ts → delete
 - src/util/deep-merge-objects.ts → delete
 - src/index.ts → update exports
 - package.json → remove axios, lodash.merge

 Per-package (repeat for dms, task, identityprovider, business-objects):
 - src/utils/http.ts → replace with simpler pkgRequest wrapper
 - src/utils/http.spec.ts → update tests
 - Every method .ts file → remove factory + transform function, add options? param, use static URL
 - Every method .spec.ts file → update mocking pattern

 Scope note: This touches ~40 method files across 4 packages. The pattern is identical for all — one example implementation unblocks the rest. A good first candidate is
 packages/task/ (already uses static URLs, simpler than DMS).

 ---
 Verification

 1. npm run build across all packages — no TypeScript errors
 2. npm test — all existing tests pass with updated mocks
 3. Manual smoke test: run a real getRepository call against a test tenant with options.signal = AbortSignal.timeout(1) → should throw AbortError
 4. Verify that plain JavaScript usage (no TypeScript) works without type errors leaking