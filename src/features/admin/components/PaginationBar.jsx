import { useState, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PAGE_SIZES = [10, 25, 50, 100];

export function usePagination(items, defaultSize = 10) {
  const [pageSize, setPageSize] = useState(defaultSize);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  // Reset when items shrink below current page
  if (page !== safePage) setTimeout(() => setPage(safePage), 0);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (s) => {
      setPageSize(s);
      setPage(1);
    },
    totalPages,
    pageItems,
    total: items.length,
    start,
  };
}

export function PaginationBar({ page, setPage, pageSize, setPageSize, totalPages, total, start }) {
  const pages = useMemo(() => {
    const arr = [];
    const max = totalPages;
    if (max <= 7) {
      for (let i = 1; i <= max; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(max - 1, page + 1); i++) arr.push(i);
      if (page < max - 2) arr.push("…");
      arr.push(max);
    }
    return arr;
  }, [page, totalPages]);

  if (total === 0) return null;
  const end = Math.min(start + pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-secondary/30 px-4 py-3 text-xs sm:flex-row">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{start + 1}-{end}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span>Rows:</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === "…" ? (
              <PaginationItem key={`e${i}`}>
                <span className="px-2 text-muted-foreground">…</span>
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
