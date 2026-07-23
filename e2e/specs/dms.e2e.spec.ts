/**
 * Live end-to-end tests for the DMS package against a real tenant.
 *
 * Run with `npm run test:e2e` (never part of `npm test`). Requires
 * base credentials plus DVELOP_E2E_DMS_* variables; self-skips if any are missing.
 * See `CONTRIBUTING.md` for details.
 *
 * Uses a fixed pre-existing test repository (repositoryId/sourceId/categoryId from env).
 * All created objects are tagged with a unique run marker and deleted in afterAll.
 *
 * Not covered by design:
 * - `updateDmsObjectStatus` — depends on workflow configuration of the test category;
 *   add once the category has a workflow enabled.
 * - `getDmsObjectPdfFile` — requires a PDF rendition; unreliable for plain-text test files.
 * - `releaseAndUpdateDmsObject` — higher-level composite; out of e2e scope.
 */
import {
  storeFileTemporarily,
  createDmsObject,
  getDmsObject,
  getDmsObjectMainFile,
  updateDmsObject,
  createDmsObjectNotes,
  getDmsObjectNotes,
  linkDmsObjects,
  unlinkDmsObjects,
  searchDmsObjects,
  deleteCurrentDmsObjectVersion,
  getRepositories,
  getRepository,
  getMappings,
} from "@dvelop-sdk/dms";
import { DvelopContext } from "@dvelop-sdk/core";
import { bootstrapE2e, readE2eEnv, readDmsEnv } from "../helpers/context.js";

const env = readE2eEnv();
const dmsEnv = env ? readDmsEnv() : undefined;
const describeE2e = dmsEnv ? describe : describe.skip;

describeE2e("dms e2e", () => {

  let context: DvelopContext;
  let marker: string;
  const createdDmsObjectIds: string[] = [];

  beforeAll(async () => {
    const bootstrap = await bootstrapE2e(env!);
    context = bootstrap.context;
    marker = bootstrap.marker;
  });

  afterAll(async () => {
    for (const dmsObjectId of createdDmsObjectIds) {
      try {
        await deleteCurrentDmsObjectVersion(context, {
          repositoryId: dmsEnv!.repositoryId,
          sourceId: dmsEnv!.sourceId,
          dmsObjectId,
          reason: "e2e cleanup"
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`e2e cleanup: failed to delete DMS object '${dmsObjectId}':`, error);
      }
    }
  });

  test("getRepositories includes the test repository", async () => {
    const repos = await getRepositories(context);
    expect(Array.isArray(repos)).toBe(true);
    expect(repos.some(r => r.repositoryId === dmsEnv!.repositoryId)).toBe(true);
  });

  test("getRepository returns the test repository by ID", async () => {
    const repo = await getRepository(context, { repositoryId: dmsEnv!.repositoryId });
    expect(repo.repositoryId).toBe(dmsEnv!.repositoryId);
    expect(repo.name).toBeTruthy();
  });

  test("getMappings returns an array for the test source", async () => {
    const mappings = await getMappings(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId
    });
    expect(Array.isArray(mappings)).toBe(true);
  });

  test("full DMS object lifecycle: store, create, read, update, notes, link, search", async () => {
    // Store a text file temporarily → contentLocationUri
    const fileContent = new TextEncoder().encode(`e2e test file ${marker}`).buffer as ArrayBuffer;
    const contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: dmsEnv!.repositoryId,
      content: fileContent
    });
    expect(contentLocationUri).toBeTruthy();

    // Create object 1
    const obj1 = await createDmsObject(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      categoryId: dmsEnv!.categoryId,
      contentLocationUri,
      fileName: `${marker}.txt`,
      properties: [{ key: dmsEnv!.propertyKey, values: [marker] }]
    });
    createdDmsObjectIds.push(obj1.dmsObjectId);

    // Read — assert property value
    const dmsObject = await getDmsObject(context, obj1);
    const prop = dmsObject.properties.find(p => p.key === dmsEnv!.propertyKey);
    expect(prop?.value).toBe(marker);

    // Read file — assert non-empty
    const fileBuffer = await getDmsObjectMainFile(context, obj1);
    expect(fileBuffer.byteLength).toBeGreaterThan(0);

    // Update property
    await updateDmsObject(context, {
      ...obj1,
      alterationText: "e2e update",
      properties: [{ key: dmsEnv!.propertyKey, values: [`${marker} updated`] }]
    });
    const updatedObj = await getDmsObject(context, obj1);
    const updatedProp = updatedObj.properties.find(p => p.key === dmsEnv!.propertyKey);
    expect(updatedProp?.value).toBe(`${marker} updated`);

    // Notes
    await createDmsObjectNotes(context, {
      repositoryId: dmsEnv!.repositoryId,
      dmsObjectId: obj1.dmsObjectId,
      noteText: `e2e note ${marker}`
    });
    const notes = await getDmsObjectNotes(context, {
      repositoryId: dmsEnv!.repositoryId,
      dmsObjectId: obj1.dmsObjectId
    });
    expect(notes.some(n => n.text === `e2e note ${marker}`)).toBe(true);

    // Create object 2 for linking
    const contentLocationUri2 = await storeFileTemporarily(context, {
      repositoryId: dmsEnv!.repositoryId,
      content: new TextEncoder().encode(`e2e link file ${marker}`).buffer as ArrayBuffer
    });
    const obj2 = await createDmsObject(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      categoryId: dmsEnv!.categoryId,
      contentLocationUri: contentLocationUri2,
      fileName: `${marker}-link.txt`,
      properties: [{ key: dmsEnv!.propertyKey, values: [`${marker}-link`] }]
    });
    createdDmsObjectIds.push(obj2.dmsObjectId);

    // Link then unlink
    await linkDmsObjects(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      parentDmsObjectId: obj1.dmsObjectId,
      childDmsObjectsIds: [obj2.dmsObjectId]
    });
    await unlinkDmsObjects(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      parentDmsObjectId: obj1.dmsObjectId,
      childDmsObjectsId: obj2.dmsObjectId
    });

    // Search — find object 1 by its updated property value
    const searchResult = await searchDmsObjects(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      properties: [{ key: dmsEnv!.propertyKey, values: [`${marker} updated`] }]
    });
    expect(searchResult.dmsObjects.some(o => o.dmsObjectId === obj1.dmsObjectId)).toBe(true);

    // Search — find object 1 via fulltext search on its file content
    const fulltextResult = await searchDmsObjects(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      fulltext: marker
    });
    expect(fulltextResult.dmsObjects.some(o => o.dmsObjectId === obj1.dmsObjectId)).toBe(true);

    // Search — filter by category, sort by property, and page
    const categoryResult = await searchDmsObjects(context, {
      repositoryId: dmsEnv!.repositoryId,
      sourceId: dmsEnv!.sourceId,
      categories: [dmsEnv!.categoryId],
      sortProperty: dmsEnv!.propertyKey,
      ascending: true,
      page: 1,
      pageSize: 50
    });
    expect(categoryResult.dmsObjects.some(o => o.dmsObjectId === obj1.dmsObjectId)).toBe(true);
  });
});
