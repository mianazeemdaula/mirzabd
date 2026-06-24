// components/store/book-grid.tsx
"use client";

import React from "react";
import { BookCard } from "@/components/store/book-card";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

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
    <StaggerList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {books.map((book) => (
        <StaggerItem key={book.id}>
          <BookCard book={book} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
export default BookGrid;
