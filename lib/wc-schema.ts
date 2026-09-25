// lib/wc-schema.ts
// Learns the structure of incoming WooCommerce API payloads (field names + types only,
// never values) and persists it per resource in the `settings` table.
import prisma from "@/lib/prisma";

export type SchemaType = "string" | "number" | "boolean" | "null" | "object" | "array";

export interface SchemaNode {
  types: SchemaType[];
  firstSeen: string;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
}

export interface ResourceSchema {
  resource: string;
  endpoints: string[]; // e.g. "POST /products/batch"
  body: SchemaNode | null;
  query: Record<string, { firstSeen: string }>;
  updatedAt: string; // last time the structure changed
  lastReceivedAt: string; // last time a payload was received (throttled)
}

export const SCHEMA_KEY_PREFIX = "wc_schema:";

// Auth params must never show up as schema fields
const IGNORED_QUERY_PARAMS = new Set(["consumer_key", "consumer_secret", "oauth_signature"]);
const MAX_ARRAY_SAMPLE = 200;
const MAX_DEPTH = 12;
const LAST_RECEIVED_THROTTLE_MS = 5 * 60 * 1000;

// Per-instance cache to avoid a DB write on every request when nothing changed
const cache = new Map<string, ResourceSchema>();

function typeOf(value: unknown): SchemaType {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "number" || t === "boolean" || t === "string" || t === "object") return t;
  return "string";
}

/** Builds a schema node for a value. */
export function inferSchema(value: unknown, now: string, depth = 0): SchemaNode {
  const type = typeOf(value);
  const node: SchemaNode = { types: [type], firstSeen: now };
  if (depth >= MAX_DEPTH) return node;

  if (type === "object") {
    node.properties = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      node.properties[key] = inferSchema(child, now, depth + 1);
    }
  } else if (type === "array") {
    let items: SchemaNode | undefined;
    for (const el of (value as unknown[]).slice(0, MAX_ARRAY_SAMPLE)) {
      const elNode = inferSchema(el, now, depth + 1);
      items = items ? mergeSchema(items, elNode) : elNode;
    }
    if (items) node.items = items;
  }
  return node;
}

/** Merges `incoming` into `base` (union of types and fields). Keeps the earliest firstSeen. */
export function mergeSchema(base: SchemaNode, incoming: SchemaNode): SchemaNode {
  const merged: SchemaNode = {
    types: Array.from(new Set([...base.types, ...incoming.types])).sort() as SchemaType[],
    firstSeen: base.firstSeen,
  };

  if (base.properties || incoming.properties) {
    merged.properties = { ...(base.properties ?? {}) };
    for (const [key, child] of Object.entries(incoming.properties ?? {})) {
      merged.properties[key] = merged.properties[key]
        ? mergeSchema(merged.properties[key], child)
        : child;
    }
  }

  if (base.items && incoming.items) merged.items = mergeSchema(base.items, incoming.items);
  else if (base.items || incoming.items) merged.items = base.items ?? incoming.items;

  return merged;
}

/**
 * Maps a request path to a resource name.
 * /wp-json/wc/v3/products/12 → "products"; /wp-json/wc/v3/products/categories/batch → "products/categories"
 */
export function resolveResource(pathname: string): { resource: string; endpoint: string; isBatch: boolean } | null {
  const match = pathname.match(/\/wp-json\/wc\/v3\/(.+?)\/?$/);
  if (!match) return null;

  const segments = match[1].split("/").filter(Boolean);
  const isBatch = segments[segments.length - 1] === "batch";
  const resourceSegments = segments.filter((s) => s !== "batch" && !/^\d+$/.test(s));
  if (resourceSegments.length === 0) return null;

  const endpoint = "/" + segments.map((s) => (/^\d+$/.test(s) ? "{id}" : s)).join("/");
  return { resource: resourceSegments.join("/"), endpoint, isBatch };
}

/**
 * Converts a request body into the item schema for its resource.
 * Batch bodies ({create, update, delete}) are unwrapped so their items describe the resource itself.
 */
function bodyToItemSchema(body: unknown, isBatch: boolean, now: string): SchemaNode | null {
  if (body === null || body === undefined || typeof body !== "object") return null;

  if (isBatch && !Array.isArray(body)) {
    const { create, update } = body as { create?: unknown; update?: unknown };
    let node: SchemaNode | null = null;
    for (const list of [create, update]) {
      if (!Array.isArray(list)) continue;
      for (const item of list.slice(0, MAX_ARRAY_SAMPLE)) {
        const itemNode = inferSchema(item, now);
        node = node ? mergeSchema(node, itemNode) : itemNode;
      }
    }
    return node;
  }

  return inferSchema(body, now);
}

async function loadSchema(resource: string): Promise<ResourceSchema | null> {
  const cached = cache.get(resource);
  if (cached) return cached;

  const row = await prisma.setting.findUnique({ where: { key: SCHEMA_KEY_PREFIX + resource } });
  const schema = (row?.value as unknown as ResourceSchema) ?? null;
  if (schema) cache.set(resource, schema);
  return schema;
}

/**
 * Records the structure of an incoming WC API request. Safe to call fire-and-forget;
 * only writes to the DB when the structure changed (or to refresh lastReceivedAt, throttled).
 */
export async function recordWcSchema(
  method: string,
  pathname: string,
  query: URLSearchParams,
  body: unknown
): Promise<void> {
  const resolved = resolveResource(pathname);
  if (!resolved) return;

  const now = new Date().toISOString();
  const bodyNode = bodyToItemSchema(body, resolved.isBatch, now);
  const endpoint = `${method.toUpperCase()} ${resolved.endpoint}`;

  const apply = (existing: ResourceSchema | null) => {
    const next: ResourceSchema = existing
      ? structuredClone(existing)
      : {
          resource: resolved.resource,
          endpoints: [],
          body: null,
          query: {},
          updatedAt: now,
          lastReceivedAt: now,
        };
    let changed = !existing;

    if (!next.endpoints.includes(endpoint)) {
      next.endpoints = [...next.endpoints, endpoint].sort();
      changed = true;
    }

    query.forEach((_value, key) => {
      if (IGNORED_QUERY_PARAMS.has(key) || next.query[key]) return;
      next.query[key] = { firstSeen: now };
      changed = true;
    });

    if (bodyNode) {
      const mergedBody = next.body ? mergeSchema(next.body, bodyNode) : bodyNode;
      if (JSON.stringify(mergedBody) !== JSON.stringify(next.body)) {
        next.body = mergedBody;
        changed = true;
      }
    }
    return { next, changed };
  };

  // Cheap check against the cached copy first — most requests change nothing
  const cached = await loadSchema(resolved.resource);
  const { changed: cachedChanged, next: cachedNext } = apply(cached);
  const receivedStale = Date.parse(cachedNext.lastReceivedAt) < Date.now() - LAST_RECEIVED_THROTTLE_MS;
  if (!cachedChanged && !receivedStale) return;

  // Re-read the latest row before writing so other server instances' fields aren't lost
  cache.delete(resolved.resource);
  const { next, changed } = apply(await loadSchema(resolved.resource));
  next.lastReceivedAt = now;
  if (changed) next.updatedAt = now;

  const value = next as unknown as object;
  await prisma.setting.upsert({
    where: { key: SCHEMA_KEY_PREFIX + resolved.resource },
    create: { key: SCHEMA_KEY_PREFIX + resolved.resource, value },
    update: { value },
  });
  cache.set(resolved.resource, next);
}

export async function getAllWcSchemas(): Promise<ResourceSchema[]> {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: SCHEMA_KEY_PREFIX } },
  });
  return rows
    .map((r) => r.value as unknown as ResourceSchema)
    .sort((a, b) => a.resource.localeCompare(b.resource));
}

export async function resetWcSchema(resource?: string): Promise<void> {
  if (resource) {
    await prisma.setting.deleteMany({ where: { key: SCHEMA_KEY_PREFIX + resource } });
    cache.delete(resource);
  } else {
    await prisma.setting.deleteMany({ where: { key: { startsWith: SCHEMA_KEY_PREFIX } } });
    cache.clear();
  }
}
