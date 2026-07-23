/**
 * Live end-to-end tests for the Identityprovider-App against a real tenant.
 *
 * Run with `npm run test:e2e` (never part of `npm test`). Requires
 * `DVELOP_E2E_SYSTEM_BASE_URI` + `DVELOP_E2E_API_KEY`; self-skips otherwise.
 * See `CONTRIBUTING.md` for details.
 *
 * Covered: `getAuthSession` (also the e2e auth bootstrap) and
 * `validateAuthSessionId` (read-only).
 *
 * Not covered, by design:
 * - `requestAppSession` — POSTs an appSession to an async external callback URI;
 *   there is no hermetic, self-contained way to assert its effect.
 */
import { getAuthSession, validateAuthSessionId } from "@dvelop-sdk/identityprovider";
import { DvelopContext } from "@dvelop-sdk/core";
import { bootstrapE2e, readE2eEnv } from "../helpers/context.js";

const env = readE2eEnv();
const describeE2e = env ? describe : describe.skip;

describeE2e("identityprovider e2e", () => {

  let context: DvelopContext;

  beforeAll(async () => {
    const bootstrap = await bootstrapE2e(env!);
    context = bootstrap.context;
  });

  test("getAuthSession exchanges the API-Key for a valid session", async () => {
    const apiKeyContext: DvelopContext = {
      systemBaseUri: env!.systemBaseUri,
      authSessionId: env!.apiKey
    };

    const session = await getAuthSession(apiKeyContext);

    expect(session.id).toBeTruthy();
    expect(session.expire.getTime()).toBeGreaterThan(Date.now());
  });

  test("validateAuthSessionId resolves the authenticated user", async () => {
    const user = await validateAuthSessionId(context);
    expect(user.id).toBeTruthy();
  });
});
