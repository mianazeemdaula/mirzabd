// app/admin/products/[id]/book-edit-wrapper.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookForm } from "@/components/admin/book-form";
import { updateBook } from "@/actions/products";
import { BookFormValues } from "@/lib/validations";

interface BookEditWrapperProps {
  bookId: number;
  categories: { id: number; name: string }[];
  defaultValues: Partial<BookFormValues>;
}

export function BookEditWrapper({ bookId, categories, defaultValues }: BookEditWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BookFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await updateBook(bookId, values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Book listing updated successfully!");
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update book listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookForm
      categories={categories}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
export default BookEditWrapper;
