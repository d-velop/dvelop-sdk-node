/**
 * Helpers for the live e2e test-suites (see `CONTRIBUTING.md`).
 *
 * This package is **dev-only** — it is never built or published. It is excluded
 * from the unit-test run and from coverage; it is only loaded by `*.e2e.spec.ts`
 * files via `jest.e2e.json`.
 */

/**
 * Builds a unique marker for a single e2e run, e.g.
 * `sdk-e2e-2026-06-25T10-12-33-456Z-a1b2c3`.
 *
 * Every resource created during e2e is tagged with this marker so that
 * concurrent runs and leftovers from crashed runs never collide on a shared
 * tenant, and so cleanup can target exactly what a run created.
 */
export function makeRunMarker(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.random().toString(36).slice(2, 8);
  return `sdk-e2e-${timestamp}-${random}`;
}
