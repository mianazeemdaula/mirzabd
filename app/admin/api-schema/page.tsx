// app/admin/api-schema/page.tsx
import { getAllWcSchemas } from "@/lib/wc-schema";
import { SchemaViewer } from "@/components/admin/schema-viewer";

export const dynamic = "force-dynamic";

export const metadata = { title: "API Schema" };

export default async function ApiSchemaPage() {
  const schemas = await getAllWcSchemas();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Incoming API Schema</h1>
        <p className="text-sm text-muted max-w-3xl">
          Field names and structure of the data your POS sends to the WooCommerce API. This page
          updates by itself: when a request includes a new field, it shows up here. Only field
          names and types are stored, never the values.
        </p>
      </div>

      <SchemaViewer schemas={schemas} />
    </div>
  );
}
