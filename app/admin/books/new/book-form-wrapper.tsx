// app/admin/books/new/book-form-wrapper.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookForm } from "@/components/admin/book-form";
import { createBook } from "@/actions/books";
import { BookFormValues } from "@/lib/validations";

interface BookFormWrapperProps {
  categories: { id: number; name: string }[];
}

export function BookFormWrapper({ categories }: BookFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BookFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await createBook(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Book listing created successfully!");
        router.push("/admin/books");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save book listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookForm
      categories={categories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
export default BookFormWrapper;
