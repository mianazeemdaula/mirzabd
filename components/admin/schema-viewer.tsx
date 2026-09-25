// components/admin/schema-viewer.tsx
"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Braces,
  ChevronRight,
  Copy,
  Check,
  Search,
  RotateCw,
  Trash2,
  FileInput,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { importSchemaFromLogsAction, resetSchemaAction } from "@/actions/wc-schema";
import type { ResourceSchema, SchemaNode } from "@/lib/wc-schema";

const RESOURCE_LABELS: Record<string, string> = {
  products: "Products",
  "products/categories": "Categories",
  "products/variations": "Variations",
  orders: "Orders",
  customers: "Customers",
  system_status: "System Status",
};

// Fields that appeared after the resource was first captured, within this window, get a "new" badge
const NEW_FIELD_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function typeLabel(node: SchemaNode): string {
  return node.types
    .map((t) => {
      if (t !== "array") return t;
      if (!node.items) return "array";
      const inner = node.items.types.filter((it) => it !== "null");
      return `array<${inner.join(" | ") || "null"}>`;
    })
    .join(" | ");
}

/** Plain JSON outline of the structure, e.g. { name: "string", images: [{ src: "string" }] } */
function toShape(node: SchemaNode): unknown {
  if (node.properties) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node.properties)) out[k] = toShape(v);
    return out;
  }
  if (node.items) return [toShape(node.items)];
  return node.types.join(" | ");
}

/** Object fields of a node, looking through arrays of objects. */
function childFields(node: SchemaNode): Record<string, SchemaNode> | undefined {
  return node.properties ?? node.items?.properties;
}

function countFields(node: SchemaNode | null): number {
  if (!node) return 0;
  const children = childFields(node);
  if (!children) return 0;
  return Object.values(children).reduce((sum, c) => sum + 1 + countFields(c), 0);
}

function matchesSearch(name: string, node: SchemaNode, q: string): boolean {
  if (name.toLowerCase().includes(q)) return true;
  const children = childFields(node);
  return children ? Object.entries(children).some(([k, v]) => matchesSearch(k, v, q)) : false;
}

function FieldRow({
  name,
  node,
  depth,
  path,
  baseline,
  now,
  search,
  collapsed,
  toggle,
}: {
  name: string;
  node: SchemaNode;
  depth: number;
  path: string;
  baseline: number;
  now: number;
  search: string;
  collapsed: Set<string>;
  toggle: (path: string) => void;
}) {
  const children = childFields(node);
  const isOpen = !collapsed.has(path) || Boolean(search);
  const seen = Date.parse(node.firstSeen);
  const isNew = seen > baseline + 60_000 && now - seen < NEW_FIELD_WINDOW_MS;

  return (
    <>
      <div
        className="flex items-center gap-2 py-1.5 pr-3 border-b border-border/50 hover:bg-elevated/50 text-sm"
        style={{ paddingLeft: 12 + depth * 20 }}
      >
        {children ? (
          <button
            onClick={() => toggle(path)}
            className="text-muted hover:text-gold cursor-pointer"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-[14px]" />
        )}
        <span className="font-mono text-ink">{name}</span>
        <span className="font-mono text-xs text-gold">{typeLabel(node)}</span>
        {children && (
          <span className="text-[11px] text-faint">{Object.keys(children).length} fields</span>
        )}
        {isNew && (
          <Badge variant="green" className="ml-1">
            new
          </Badge>
        )}
        <span
          className="ml-auto text-[11px] text-faint whitespace-nowrap"
          title={new Date(node.firstSeen).toLocaleString()}
        >
          first seen {formatDistanceToNow(seen, { addSuffix: true })}
        </span>
      </div>

      {children &&
        isOpen &&
        Object.entries(children)
          .filter(([k, v]) => !search || matchesSearch(k, v, search))
          .map(([k, v]) => (
            <FieldRow
              key={k}
              name={k}
              node={v}
              depth={depth + 1}
              path={`${path}.${k}`}
              baseline={baseline}
              now={now}
              search={search}
              collapsed={collapsed}
              toggle={toggle}
            />
          ))}
    </>
  );
}

export function SchemaViewer({ schemas }: { schemas: ResourceSchema[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(schemas[0]?.resource ?? "");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => Date.now());

  const schema = schemas.find((s) => s.resource === active) ?? schemas[0];
  const q = search.trim().toLowerCase();

  const allParentPaths = useMemo(() => {
    const paths: string[] = [];
    const walk = (node: SchemaNode, path: string) => {
      const children = childFields(node);
      if (!children) return;
      for (const [k, v] of Object.entries(children)) {
        if (childFields(v)) {
          paths.push(`${path}.${k}`);
          walk(v, `${path}.${k}`);
        }
      }
    };
    if (schema?.body) walk(schema.body, "root");
    return paths;
  }, [schema]);

  const toggle = (path: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const handleImport = () =>
    startTransition(async () => {
      const res = await importSchemaFromLogsAction();
      if (res.error) toast.error(res.error);
      else toast.success(`Imported structure from ${res.imported} logged requests`);
      router.refresh();
    });

  const handleReset = () =>
    startTransition(async () => {
      if (!schema) return;
      const res = await resetSchemaAction(schema.resource);
      if (res.error) toast.error(res.error);
      else toast.success(`Cleared ${RESOURCE_LABELS[schema.resource] ?? schema.resource} schema`);
      router.refresh();
    });

  const handleCopy = async () => {
    if (!schema?.body) return;
    await navigator.clipboard.writeText(JSON.stringify(toShape(schema.body), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const toolbarBtn =
    "inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-btn)] border border-border text-xs font-semibold text-ink hover:border-gold hover:text-gold transition-colors disabled:opacity-50 cursor-pointer";

  if (!schema) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-10 text-center space-y-4">
        <Braces className="mx-auto text-gold" size={32} />
        <div className="space-y-1">
          <p className="text-ink font-semibold">No incoming data captured yet</p>
          <p className="text-sm text-muted">
            The schema is filled in automatically the next time your POS syncs products or
            categories.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={handleImport} disabled={isPending} className={toolbarBtn}>
            <FileInput size={14} /> Import from API logs
          </button>
          <button onClick={() => router.refresh()} disabled={isPending} className={toolbarBtn}>
            <RotateCw size={14} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  const rootFields = schema.body ? childFields(schema.body) : undefined;
  const baseline = schema.body ? Date.parse(schema.body.firstSeen) : 0;
  const queryParams = Object.keys(schema.query).sort();

  return (
    <div className="space-y-4">
      {/* Resource tabs */}
      <div className="flex flex-wrap gap-2">
        {schemas.map((s) => (
          <button
            key={s.resource}
            onClick={() => {
              setActive(s.resource);
              setCollapsed(new Set());
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              s.resource === schema.resource
                ? "bg-gold/15 border-gold/40 text-gold"
                : "border-border text-muted hover:text-ink hover:border-gold/40"
            }`}
          >
            {RESOURCE_LABELS[s.resource] ?? s.resource}
            <span className="ml-2 font-mono text-[10px] opacity-70">{countFields(s.body)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        {/* Field tree */}
        <div className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fields..."
                className="w-full h-8 bg-elevated border border-border rounded-[var(--radius-btn)] pl-8 pr-2.5 text-xs text-ink placeholder:text-faint focus:outline-none focus:border-gold"
              />
            </div>
            <button onClick={() => setCollapsed(new Set())} className={toolbarBtn} title="Expand all">
              <ChevronsUpDown size={14} />
            </button>
            <button
              onClick={() => setCollapsed(new Set(allParentPaths))}
              className={toolbarBtn}
              title="Collapse all"
            >
              <ChevronsDownUp size={14} />
            </button>
            <button onClick={handleCopy} disabled={!schema.body} className={toolbarBtn}>
              {copied ? <Check size={14} /> : <Copy size={14} />} Copy JSON
            </button>
          </div>

          {rootFields ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {Object.entries(rootFields)
                .filter(([k, v]) => !q || matchesSearch(k, v, q))
                .map(([k, v]) => (
                  <FieldRow
                    key={k}
                    name={k}
                    node={v}
                    depth={0}
                    path={`root.${k}`}
                    baseline={baseline}
                    now={now}
                    search={q}
                    collapsed={collapsed}
                    toggle={toggle}
                  />
                ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-muted text-center">
              No request body received for this resource yet. Only read requests (GET) have been seen.
            </p>
          )}
        </div>

        {/* Meta panel */}
        <aside className="space-y-4">
          <div className="bg-surface border border-border rounded-[var(--radius-card)] p-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Total fields</span>
              <span className="font-mono text-ink">{countFields(schema.body)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Last data received</span>
              <span className="text-ink">
                {formatDistanceToNow(new Date(schema.lastReceivedAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Structure last changed</span>
              <span className="text-ink">
                {formatDistanceToNow(new Date(schema.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-card)] p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Endpoints hit</h3>
            <ul className="space-y-1">
              {schema.endpoints.map((e) => (
                <li key={e} className="font-mono text-[11px] text-ink break-all">
                  {e}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-[var(--radius-card)] p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Query parameters</h3>
            {queryParams.length === 0 ? (
              <p className="text-[11px] text-faint">None seen</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {queryParams.map((p) => (
                  <Badge key={p} variant="outline" className="normal-case">
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.refresh()} disabled={isPending} className={toolbarBtn}>
              <RotateCw size={14} /> Refresh
            </button>
            <button onClick={handleImport} disabled={isPending} className={toolbarBtn}>
              <FileInput size={14} /> Import from logs
            </button>
            <button
              onClick={handleReset}
              disabled={isPending}
              className={`${toolbarBtn} hover:!border-crimson hover:!text-crimson`}
              title="Clear this schema; it rebuilds from the next incoming requests"
            >
              <Trash2 size={14} /> Reset
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
