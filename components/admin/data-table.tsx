// components/admin/data-table.tsx
import React from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  searchPlaceholder = "Search items...",
  searchValue = "",
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Top search control row */}
      {onSearchChange !== undefined && (
        <div className="flex items-center relative max-w-sm">
          <Search size={16} className="absolute left-3 text-muted pointer-events-none" />
          <input
            type="text"
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            className="w-full bg-surface border border-border text-ink text-xs rounded-[var(--radius-btn)] h-9 pl-9 pr-4 focus:outline-none focus:border-gold placeholder:text-faint"
          />
        </div>
      )}

      {/* Main Table box */}
      <div className="border border-border bg-surface rounded-[var(--radius-card)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-border/60">
            <thead className="bg-elevated/40">
              <tr>
                {columns.map((col) => (
                  <th
                     key={col.key}
                     scope="col"
                     className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted ${
                       col.align === "center"
                         ? "text-center"
                         : col.align === "right"
                         ? "text-right"
                         : "text-left"
                     }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm text-ink bg-surface/50">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-4 bg-elevated rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty state row
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-muted">
                    No items found.
                  </td>
                </tr>
              ) : (
                // Data Rows
                data.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-elevated/20 transition-colors"
                  >
                    {columns.map((col) => {
                      const value = (item as any)[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`px-6 py-4 whitespace-nowrap align-middle ${
                            col.align === "center"
                              ? "text-center"
                              : col.align === "right"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {col.render ? col.render(item) : String(value ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Info Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-elevated/10">
            <span className="text-xs text-muted">
              Page <span className="font-bold text-ink">{currentPage}</span> of{" "}
              <span className="font-bold text-ink">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1 || loading}
                className="h-8 w-8 p-0 rounded-[var(--radius-btn)] border border-border text-ink hover:border-gold cursor-pointer"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= totalPages || loading}
                className="h-8 w-8 p-0 rounded-[var(--radius-btn)] border border-border text-ink hover:border-gold cursor-pointer"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
