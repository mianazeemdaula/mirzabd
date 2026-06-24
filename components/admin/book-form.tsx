// components/admin/book-form.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookSchema, BookFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify_safe } from "@/lib/utils";

interface BookFormProps {
  defaultValues?: Partial<BookFormValues>;
  onSubmit: (values: BookFormValues) => Promise<void>;
  categories: { id: number; name: string }[];
  isSubmitting?: boolean;
}

export function BookForm({
  defaultValues,
  onSubmit,
  categories,
  isSubmitting = false,
}: BookFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(BookSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "simple",
      status: "publish",
      description: "",
      shortDescription: "",
      sku: "",
      isbn: "",
      author: "",
      publisher: "",
      publishYear: null,
      pages: null,
      language: "English",
      regularPrice: 0,
      salePrice: null,
      manageStock: false,
      stockQuantity: 10,
      stockStatus: "instock",
      weight: null,
      isFeatured: false,
      images: [],
      attributes: [],
      categoryIds: [],
      tagIds: [],
      metaTitle: "",
      metaDescription: "",
      ...defaultValues,
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const bookName = watch("name");
  const watchManageStock = watch("manageStock");
  const watchImages = watch("images");

  // Auto-slugify the book title in real-time
  useEffect(() => {
    if (bookName && !defaultValues?.slug) {
      setValue("slug", slugify_safe(bookName), { shouldValidate: true });
    }
  }, [bookName, setValue, defaultValues]);

  // Handle category checkbox selection changes
  const handleCategoryCheckboxChange = (catId: number, isChecked: boolean) => {
    const currentCats = watch("categoryIds") || [];
    let updatedCats = [...currentCats];
    if (isChecked) {
      updatedCats.push(catId);
    } else {
      updatedCats = updatedCats.filter((id) => id !== catId);
    }
    setValue("categoryIds", updatedCats, { shouldValidate: true });
  };

  const handleAddImagePlaceholder = () => {
    const url = prompt("Enter Image URL (e.g. https://images.unsplash.com/...)");
    if (url) {
      appendImage({ src: url, alt: "", position: watchImages.length });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl pb-12">
      {/* SECTION 1: Basic Info */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2">
          Basic Product Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Title *"
            {...register("name")}
            placeholder="e.g. Peer-e-Kamil"
            error={errors.name?.message}
          />
          <Input
            label="URL Slug *"
            {...register("slug")}
            placeholder="e.g. peer-e-kamil"
            error={errors.slug?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Author / Writer Name"
            {...register("author")}
            placeholder="e.g. Umera Ahmad"
            error={errors.author?.message}
          />
          <Input
            label="Publisher"
            {...register("publisher")}
            placeholder="e.g. Ferozsons"
            error={errors.publisher?.message}
          />
          <Input
            label="ISBN Number"
            {...register("isbn")}
            placeholder="e.g. 9789696450009"
            error={errors.isbn?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Publishing Year"
            type="number"
            {...register("publishYear")}
            placeholder="e.g. 2004"
            error={errors.publishYear?.message}
          />
          <Input
            label="Page Count"
            type="number"
            {...register("pages")}
            placeholder="e.g. 512"
            error={errors.pages?.message}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Language
            </label>
            <select
              {...register("language")}
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="Urdu">Urdu</option>
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
              <option value="Persian">Persian</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Product Description (Full)
          </label>
          <textarea
            {...register("description")}
            placeholder="Write full summary or synopsis..."
            rows={5}
            className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
            Short Description (Excerpt)
          </label>
          <textarea
            {...register("shortDescription")}
            placeholder="Brief tagline or excerpt..."
            rows={2}
            className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: Pricing & Inventory */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2">
          Pricing & Stock Inventory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Regular Price (PKR) *"
            type="number"
            {...register("regularPrice")}
            placeholder="1500"
            error={errors.regularPrice?.message}
          />
          <Input
            label="Sale Price (PKR)"
            type="number"
            {...register("salePrice")}
            placeholder="1200"
            error={errors.salePrice?.message}
          />
          <Input
            label="Inventory SKU Code"
            {...register("sku")}
            placeholder="e.g. PK-978-001"
            error={errors.sku?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Manage Stock Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="manageStock"
              {...register("manageStock")}
              className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
            />
            <label htmlFor="manageStock" className="text-sm text-ink cursor-pointer">
              Manage inventory stock levels manually
            </label>
          </div>

          {/* Stock Status Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Stock Status
            </label>
            <select
              {...register("stockStatus")}
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
              <option value="onbackorder">On Backorder</option>
            </select>
          </div>
        </div>

        {/* Stock quantity input (shown only if manageStock is true) */}
        {watchManageStock && (
          <div className="max-w-xs">
            <Input
              label="Stock Quantity Available *"
              type="number"
              {...register("stockQuantity")}
              placeholder="10"
              error={errors.stockQuantity?.message}
            />
          </div>
        )}
      </div>

      {/* SECTION 3: Catalog Classification & Cover Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories checklist */}
        <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2">
            Categories Classification
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2.5 text-sm text-ink cursor-pointer hover:text-gold transition-colors">
                <input
                  type="checkbox"
                  checked={(watch("categoryIds") || []).includes(cat.id)}
                  onChange={(e) => handleCategoryCheckboxChange(cat.id, e.target.checked)}
                  className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
          {errors.categoryIds && (
            <span className="text-xs text-crimson block mt-1">{errors.categoryIds.message}</span>
          )}
        </div>

        {/* Images lists */}
        <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
              Product Cover Images
            </h3>
            <button
              type="button"
              onClick={handleAddImagePlaceholder}
              className="text-[10px] font-bold text-gold hover:underline uppercase tracking-wide cursor-pointer"
            >
              + Add Image URL
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
            {imageFields.length === 0 ? (
              <p className="text-xs text-muted">No images added. Click "+ Add Image URL" above to set a cover preview.</p>
            ) : (
              imageFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 border border-border bg-void/50 p-2.5 rounded-md relative group">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted font-bold block mb-0.5">Image URL #{index + 1}</span>
                    <span className="text-xs text-ink truncate block">{field.src}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-muted hover:text-crimson p-1 cursor-pointer"
                    aria-label="Remove image"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: SEO Metadata */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold border-b border-border/60 pb-2">
          SEO Optimization Details
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="SEO Meta Title"
            {...register("metaTitle")}
            placeholder="Custom HTML search engine title..."
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              SEO Meta Description
            </label>
            <textarea
              {...register("metaDescription")}
              placeholder="HTML meta description search tag snippet..."
              rows={2}
              className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Status / Publishing */}
      <div className="bg-surface border border-border p-6 rounded-[var(--radius-card)] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Status Select */}
          <div className="space-y-1.5 min-w-[150px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Publish Status
            </label>
            <select
              {...register("status")}
              className="bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="publish">Published</option>
              <option value="draft">Draft (Hidden)</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2.5 pt-4">
            <input
              type="checkbox"
              id="isFeatured"
              {...register("isFeatured")}
              className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
            />
            <label htmlFor="isFeatured" className="text-sm text-ink cursor-pointer">
              Mark as Featured title on Homepage
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="px-8 h-12 rounded-[var(--radius-btn)] font-bold shadow-md hover:shadow-gold/15"
          >
            {isSubmitting ? "Publishing..." : "Save Product Listings"}
          </Button>
        </div>
      </div>
    </form>
  );
}
export default BookForm;
