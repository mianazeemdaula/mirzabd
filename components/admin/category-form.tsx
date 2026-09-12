// components/admin/category-form.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema, CategoryFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryImageUpload } from "@/components/admin/category-image-upload";
import { slugify_safe } from "@/lib/utils";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  categories: { id: number; name: string }[];
  isSubmitting?: boolean;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  categories,
  isSubmitting = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      description: "",
      imageUrl: null,
      displayOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const categoryName = watch("name");

  // Auto-generate slug from name in real-time
  useEffect(() => {
    if (categoryName && !defaultValues?.slug) {
      setValue("slug", slugify_safe(categoryName), { shouldValidate: true });
    }
  }, [categoryName, setValue, defaultValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {/* Category Name */}
      <Input
        label="Category Name *"
        {...register("name")}
        placeholder="e.g. Fiction, Stationery, Children's Books"
        error={errors.name?.message}
      />

      {/* URL Slug */}
      <Input
        label="URL Slug *"
        {...register("slug")}
        placeholder="e.g. fiction-collection"
        error={errors.slug?.message}
      />

      {/* Parent Category Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Parent Category
        </label>
        <select
          {...register("parentId")}
          className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
        >
          <option value="">-- None (Top Level) --</option>
          {categories
            .filter((c) => !defaultValues?.name || c.name !== defaultValues.name) // prevent self-parenting
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        {errors.parentId && (
          <span className="text-xs text-crimson block mt-1">{errors.parentId.message}</span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Brief description about products in this category..."
          rows={3}
          className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
        />
      </div>

      {/* Category Logo Upload */}
      <CategoryImageUpload
        value={watch("imageUrl") || null}
        onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })}
        categoryName={categoryName}
      />

      {/* Display Order */}
      <Input
        label="Display Order (Menu Order)"
        type="number"
        {...register("displayOrder")}
        placeholder="0"
        error={errors.displayOrder?.message}
      />

      {/* Active State Toggle */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer hover:text-ink transition-colors">
          <input
            type="checkbox"
            {...register("isActive")}
            className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
          />
          <span>Visible to customers (Active)</span>
        </label>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          className="w-full sm:w-auto px-6 h-11 rounded-[var(--radius-btn)] font-semibold"
        >
          {isSubmitting ? "Saving..." : "Save Category"}
        </Button>
      </div>
    </form>
  );
}
export default CategoryForm;
