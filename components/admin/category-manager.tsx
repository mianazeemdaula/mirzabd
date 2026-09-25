// components/admin/category-manager.tsx
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  ImageIcon,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { slugify_safe } from "@/lib/utils";
import { toast } from "sonner";

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  parent?: { id: number; name: string } | null;
  _count?: { products: number };
}

interface CategoryManagerProps {
  initialCategories: CategoryData[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isPending, startTransition] = useTransition();

  // Reset form to blank / create mode
  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setImageUrl(null);
    setDisplayOrder(0);
    setIsActive(true);
  };

  // Populate form for editing
  const startEdit = (cat: CategoryData) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parentId ? String(cat.parentId) : "");
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || null);
    setDisplayOrder(cat.displayOrder ?? 0);
    setIsActive(cat.isActive ?? true);

    // Scroll smoothly to form on mobile devices
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-generate slug when name changes (only in create mode or if slug matches old slug)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugify_safe(val));
    }
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          slug: slug.trim() || slugify_safe(name),
          parentId: parentId ? parseInt(parentId, 10) : null,
          description: description.trim(),
          imageUrl: imageUrl || null,
          displayOrder: Number(displayOrder) || 0,
          isActive,
        };

        if (editingCategory) {
          // UPDATE
          const res = await updateCategory({
            ...payload,
            id: editingCategory.id,
          });

          if (res.error) {
            toast.error(res.error);
            return;
          }

          toast.success(`Category "${name}" updated successfully!`);
          // Update local state
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    ...res.category,
                    parent: res.category?.parentId
                      ? prev.find((p) => p.id === res.category.parentId) || null
                      : null,
                  }
                : c
            )
          );
          resetForm();
        } else {
          // CREATE
          const res = await createCategory(payload);

          if (res.error) {
            toast.error(res.error);
            return;
          }

          toast.success(`Category "${name}" created successfully!`);
          if (res.category) {
            const newCat: CategoryData = {
              ...res.category,
              _count: { products: 0 },
              parent: res.category.parentId
                ? categories.find((p) => p.id === res.category.parentId) || null
                : null,
            };
            setCategories((prev) => [...prev, newCat]);
          }
          resetForm();
        }
      } catch (err: any) {
        console.error("Save error:", err);
        toast.error(err.message || "An error occurred while saving the category.");
      }
    });
  };

  // Handle Category Deletion
  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", String(id));

        const res = await deleteCategory(formData);
        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success(`Category "${catName}" deleted`);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (editingCategory?.id === id) {
          resetForm();
        }
      } catch (err: any) {
        console.error("Delete error:", err);
        toast.error("Failed to delete category.");
      }
    });
  };

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Panel: Categories List & Table */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search Bar & Quick Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface border border-border p-3.5 rounded-[var(--radius-card)]">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name or slug..."
              className="w-full bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] pl-9 pr-3 py-2 focus:outline-none focus:border-gold placeholder:text-faint"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted w-full sm:w-auto justify-between sm:justify-end">
            <span>
              Total: <strong className="text-ink">{categories.length}</strong>
            </span>
            <span>•</span>
            <span>
              With Logo:{" "}
              <strong className="text-gold">
                {categories.filter((c) => !!c.imageUrl).length}
              </strong>
            </span>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-border/60">
              <thead className="bg-elevated/40">
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3.5">Logo</th>
                  <th className="px-4 py-3.5">Category Name</th>
                  <th className="px-4 py-3.5">Slug</th>
                  <th className="px-3 py-3.5 text-center">Order</th>
                  <th className="px-3 py-3.5 text-center">Books</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm text-ink">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted">
                      {searchQuery
                        ? "No categories match your search."
                        : "No categories found. Create your first category on the right."}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isBeingEdited = editingCategory?.id === cat.id;

                    return (
                      <tr
                        key={cat.id}
                        className={`transition-colors ${
                          isBeingEdited
                            ? "bg-gold/10 border-l-2 border-l-gold"
                            : "hover:bg-elevated/20"
                        }`}
                      >
                        {/* Circular Logo Preview */}
                        <td className="px-4 py-3.5">
                          <div className="relative w-10 h-10 rounded-full border border-border/80 bg-elevated flex items-center justify-center overflow-hidden shadow-xs">
                            {cat.imageUrl ? (
                              <Image
                                src={cat.imageUrl}
                                alt={cat.name}
                                fill
                                sizes="40px"
                                className="object-contain p-1 rounded-full"
                                unoptimized={cat.imageUrl.startsWith("http")}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted/60 bg-void/30">
                                <Layers size={16} />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name & Parent */}
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-ink block text-xs sm:text-sm">
                            {cat.name}
                          </span>
                          {cat.parent && (
                            <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                              <FolderOpen size={10} className="text-gold" />
                              Parent: {cat.parent.name}
                            </span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3.5 font-mono text-xs text-muted max-w-[140px] truncate">
                          {cat.slug}
                        </td>

                        {/* Display Order */}
                        <td className="px-3 py-3.5 text-center font-mono text-xs">
                          {cat.displayOrder}
                        </td>

                        {/* Books Count */}
                        <td className="px-3 py-3.5 text-center font-mono text-xs text-gold font-bold">
                          {cat._count?.products ?? 0}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3.5 text-center">
                          <Badge
                            variant={cat.isActive ? "green" : "outline"}
                            className="rounded text-[10px]"
                          >
                            {cat.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              className={`p-1.5 rounded transition-colors cursor-pointer ${
                                isBeingEdited
                                  ? "bg-gold text-void"
                                  : "hover:bg-elevated text-muted hover:text-gold"
                              }`}
                              title="Edit Category & Logo"
                              aria-label="Edit category"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 rounded hover:bg-elevated text-muted hover:text-crimson transition-colors cursor-pointer"
                              title="Delete Category"
                              aria-label="Delete category"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Panel: Create / Edit Category Form */}
      <div className="lg:col-span-5 xl:col-span-4 bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-5 sticky top-24 shadow-sm">
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-1.5">
              {editingCategory ? (
                <>
                  <Edit2 size={15} />
                  Edit Category
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Category
                </>
              )}
            </h3>
            {editingCategory && (
              <p className="text-[11px] text-muted truncate mt-0.5">
                Editing: <span className="text-ink font-semibold">{editingCategory.name}</span>
              </p>
            )}
          </div>

          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[11px] text-muted hover:text-ink underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload System with Circular Preview */}
          <CategoryImageUpload
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            categoryName={name}
          />

          {/* Category Name */}
          <Input
            label="Category Name *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Fiction, Islamic Books, Stationery"
            required
          />

          {/* URL Slug */}
          <Input
            label="URL Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={() => setSlug(slugify_safe(slug))}
            placeholder="Auto-generated from name, e.g. fiction-collection"
          />

          {/* Parent Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Parent Category (Optional)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="">-- None (Top Level) --</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id) // prevent self-parenting
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary describing products in this category..."
              rows={3}
              className="w-full bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
            />
          </div>

          {/* Display Order */}
          <Input
            label="Display Order (Sort Hierarchy)"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
          />

          {/* Active State Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-muted cursor-pointer hover:text-ink transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
              />
              <span>Visible to customers (Active)</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending}
              variant="primary"
              className="flex-1 h-11 rounded-[var(--radius-btn)] font-semibold text-xs flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Update Category"
              ) : (
                "Save Category"
              )}
            </Button>

            {editingCategory && (
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                className="h-11 px-4 text-xs"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryManager;
