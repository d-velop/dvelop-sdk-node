/**
 * Live end-to-end tests for the business-objects package against a real tenant.
 *
 * Run with `npm run test:e2e` (never part of `npm test`). Requires base
 * credentials plus DVELOP_E2E_BO_* variables; self-skips if any are missing.
 * See `CONTRIBUTING.md` for details.
 *
 * The entity model has a client-assigned GUID key (`id`) and a string `name`
 * field. The `name` field is stamped with the run marker so concurrent runs
 * don't collide.
 */
import { createBoEntity, getBoEntity, getBoEntities, updateBoEntity, deleteBoEntity } from "@dvelop-sdk/business-objects";
import { DvelopContext } from "@dvelop-sdk/core";
import { bootstrapE2e, readE2eEnv, readBoEnv } from "../helpers/context.js";

const env = readE2eEnv();
const boEnv = env ? readBoEnv() : undefined;
const describeE2e = boEnv ? describe : describe.skip;

describeE2e("business-objects e2e", () => {

  let context: DvelopContext;
  let marker: string;
  const createdEntityKeys: string[] = [];

  beforeAll(async () => {
    const bootstrap = await bootstrapE2e(env!);
    context = bootstrap.context;
    marker = bootstrap.marker;
  });

  afterAll(async () => {
    for (const entityKey of createdEntityKeys) {
      try {
        await deleteBoEntity(context, {
          modelName: boEnv!.modelName,
          pluralEntityName: boEnv!.pluralEntityName,
          keyPropertyType: "guid",
          keyPropertyValue: entityKey
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`e2e cleanup: failed to delete BO entity '${entityKey}':`, error);
      }
    }
  });

  test("full business-objects lifecycle: create, get, getEntities, update, delete", async () => {
    // Client-assigned GUID key — required by the entity model
    const entityId = crypto.randomUUID();

    // Create
    await createBoEntity(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName,
      entity: { id: entityId, name: marker }
    });
    createdEntityKeys.push(entityId);

    // Get — assert the name field matches the marker
    const entity = await getBoEntity(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName,
      keyPropertyType: "guid",
      keyPropertyValue: entityId
    });
    expect((entity as any).name).toBe(marker);

    // GetEntities — assert the created entity appears in the list
    const page = await getBoEntities(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName
    });
    expect(page.value.some((e: any) => (e as any).name === marker)).toBe(true);

    // Update — change name only (id is the key and must not appear in the body)
    await updateBoEntity(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName,
      keyPropertyType: "guid",
      keyPropertyValue: entityId,
      entityChange: { name: `${marker} updated` }
    });
    const updatedEntity = await getBoEntity(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName,
      keyPropertyType: "guid",
      keyPropertyValue: entityId
    });
    expect((updatedEntity as any).name).toBe(`${marker} updated`);

    // Delete (explicit — afterAll is the safety net)
    await deleteBoEntity(context, {
      modelName: boEnv!.modelName,
      pluralEntityName: boEnv!.pluralEntityName,
      keyPropertyType: "guid",
      keyPropertyValue: entityId
    });
    createdEntityKeys.splice(createdEntityKeys.indexOf(entityId), 1);
  });
});
