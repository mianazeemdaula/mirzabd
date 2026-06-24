// app/admin/categories/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { Trash2, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory, deleteCategory } from "@/actions/categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // 1. Fetch categories including parent references and product count updates
  const categories = await prisma.category.findMany({
    include: {
      parent: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Categories Management</h1>
          <p className="text-xs text-muted">Manage product grouping, category hierarchy and display hierarchy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Categories Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-border/60">
              <thead className="bg-elevated/40">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">Display Order</th>
                  <th className="px-6 py-3.5 text-center">Books Count</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm text-ink">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                      No categories found. Add one on the right to get started.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-elevated/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-ink block">{cat.name}</span>
                        {cat.parent && (
                          <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                            <FolderOpen size={10} className="text-gold" />
                            Parent: {cat.parent.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted">{cat.slug}</td>
                      <td className="px-6 py-4 text-center font-mono text-xs">{cat.displayOrder}</td>
                      <td className="px-6 py-4 text-center font-mono text-xs text-gold font-bold">
                        {cat._count.products}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={cat.isActive ? "green" : "outline"} className="rounded text-[10px]">
                          {cat.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={cat.id} />
                          <button
                            type="submit"
                            className="p-1.5 rounded hover:bg-elevated text-muted hover:text-crimson transition-colors cursor-pointer"
                            aria-label="Delete category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Add Category Form Card */}
        <div className="lg:col-span-4 bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2 flex items-center gap-1.5">
            <Plus size={16} />
            Create Category
          </h3>

          <form action={createCategory} className="space-y-4">
            <Input
              label="Category Name *"
              name="name"
              placeholder="e.g. History, Biography"
              required
            />
            <Input
              label="URL Slug (Optional)"
              name="slug"
              placeholder="e.g. history-books"
            />
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Parent Category (Optional)
              </label>
              <select
                name="parentId"
                className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="">-- None (Top Level) --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Brief summary describing the category..."
                rows={3}
                className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none text-xs"
              />
            </div>

            <Input
              label="Display order number"
              name="displayOrder"
              type="number"
              defaultValue="0"
            />

            <div className="pt-1">
              <label className="flex items-center gap-2.5 text-xs text-muted cursor-pointer hover:text-ink transition-colors">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
                />
                <span>Visible to customers (Active)</span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full h-11 rounded-[var(--radius-btn)] font-semibold text-xs">
                Save Category
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
