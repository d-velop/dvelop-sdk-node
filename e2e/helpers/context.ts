import { DvelopContext } from "@dvelop-sdk/core";
import { getAuthSession, validateAuthSessionId, DvelopUser } from "@dvelop-sdk/identityprovider";
import { makeRunMarker } from "./marker.js";

/**
 * Credentials and configuration read from the environment for a live e2e run.
 * See `.env.example` for the full list of variables.
 */
export interface E2eEnv {
  /** Tenant base URI, e.g. `https://tenant.d-velop.cloud`. */
  systemBaseUri: string;
  /** Admin API-Key, exchanged for a live authSessionId during bootstrap. */
  apiKey: string;
}

/**
 * Reads the e2e environment. Returns `undefined` when the mandatory variables
 * are missing, which the suites use to `describe.skip` themselves so that
 * contributors without a tenant (and the normal `npm test` run) stay green.
 */
export function readE2eEnv(): E2eEnv | undefined {
  const systemBaseUri = process.env.DVELOP_E2E_SYSTEM_BASE_URI;
  const apiKey = process.env.DVELOP_E2E_API_KEY;

  if (!systemBaseUri || !apiKey) {
    return undefined;
  }

  return {
    systemBaseUri,
    apiKey
  };
}

/**
 * The result of bootstrapping a live e2e run: a ready-to-use {@link DvelopContext}
 * with a freshly minted authSessionId, the authenticated user, and the run marker.
 */
export interface E2eBootstrap {
  /** Context carrying `systemBaseUri` + the minted `authSessionId`. */
  context: DvelopContext;
  /** The authenticated user behind the API-Key (used e.g. as a task assignee). */
  user: DvelopUser;
  /** Unique marker for this run (see {@link makeRunMarker}). */
  marker: string;
}

/**
 * DMS-specific env vars (Phase 2). All four must be set; the suite self-skips otherwise.
 */
export interface DmsEnv {
  /** ID of the fixed test repository. */
  repositoryId: string;
  /** Source ID within that repository. */
  sourceId: string;
  /** Category ID used when creating DMS objects. */
  categoryId: string;
  /** Key of a writable string property on the category (used to stamp the run marker). */
  propertyKey: string;
}

/**
 * Reads the DMS e2e environment. Returns `undefined` when any variable is missing.
 */
export function readDmsEnv(): DmsEnv | undefined {
  const repositoryId = process.env.DVELOP_E2E_DMS_REPOSITORY_ID;
  const sourceId = process.env.DVELOP_E2E_DMS_SOURCE_ID;
  const categoryId = process.env.DVELOP_E2E_DMS_CATEGORY_ID;
  const propertyKey = process.env.DVELOP_E2E_DMS_PROPERTY_KEY;
  if (!repositoryId || !sourceId || !categoryId || !propertyKey) return undefined;
  return { repositoryId, sourceId, categoryId, propertyKey };
}

/**
 * Business-objects-specific env vars (Phase 2). Both must be set; the suite self-skips otherwise.
 */
export interface BoEnv {
  /** Name of the business-objects model (e.g. `sdktest`). */
  modelName: string;
  /** Plural entity name in the model (e.g. `SdkTests`). */
  pluralEntityName: string;
}

/**
 * Reads the business-objects e2e environment. Returns `undefined` when any variable is missing.
 */
export function readBoEnv(): BoEnv | undefined {
  const modelName = process.env.DVELOP_E2E_BO_MODEL_NAME;
  const pluralEntityName = process.env.DVELOP_E2E_BO_PLURAL_ENTITY_NAME;
  if (!modelName || !pluralEntityName) return undefined;
  return { modelName, pluralEntityName };
}

/**
 * Exchanges the API-Key for a live authSessionId via `getAuthSession`, then
 * resolves the authenticated user via `validateAuthSessionId`. This exercises
 * the identityprovider auth flow for real on every e2e run.
 */
export async function bootstrapE2e(env: E2eEnv): Promise<E2eBootstrap> {
  const apiKeyContext: DvelopContext = {
    systemBaseUri: env.systemBaseUri,
    authSessionId: env.apiKey
  };

  const session = await getAuthSession(apiKeyContext);

  const context: DvelopContext = {
    systemBaseUri: env.systemBaseUri,
    authSessionId: session.id
  };

  const user = await validateAuthSessionId(context);

  return {
    context,
    user,
    marker: makeRunMarker()
  };
}
