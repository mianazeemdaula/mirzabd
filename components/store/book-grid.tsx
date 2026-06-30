// components/store/book-grid.tsx
"use client";

import React from "react";
import { BookCard } from "@/components/store/book-card";

interface BookGridProps {
  books: any[];
}

export function BookGrid({ books }: BookGridProps) {
  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted text-lg">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
