"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/pagination-utils";
import { cn } from "@/lib/utils";
import styles from "./PaginatedList.module.scss";

export default function PaginatedList({
  items = [],
  pageSize = 6,
  renderItem,
  className,
  emptyMessage = "No items to show.",
  page: controlledPage,
  onPageChange,
  paginationClassName,
  showPageMeta = false,
  scrollOnPageChange = true,
}) {
  const [internalPage, setInternalPage] = useState(1);
  const listRef = useRef(null);
  const isControlled = controlledPage !== undefined;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = isControlled ? controlledPage : internalPage;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const setPage = (nextPage) => {
    const resolvedPage =
      typeof nextPage === "function" ? nextPage(safePage) : nextPage;
    const clampedPage = Math.min(Math.max(1, resolvedPage), totalPages);

    if (isControlled) {
      onPageChange?.(clampedPage);
      return;
    }

    setInternalPage(clampedPage);
  };

  useEffect(() => {
    if (!isControlled && internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [internalPage, isControlled, totalPages]);

  useEffect(() => {
    if (!scrollOnPageChange) return;
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [safePage, scrollOnPageChange]);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, pageSize, safePage]
  );

  const paginationRange = useMemo(
    () => getPaginationRange(safePage, totalPages),
    [safePage, totalPages]
  );

  if (items.length === 0) {
    if (!emptyMessage) return null;

    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <>
      <div className={className} ref={listRef}>
        {pageItems.map((item, index) => renderItem(item, index, safePage))}
      </div>

      {totalPages > 1 && (
        <Pagination className={cn(styles.pagination, paginationClassName)}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 1}
              />
            </PaginationItem>

            {paginationRange.map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === safePage}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(safePage + 1)}
                disabled={safePage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {showPageMeta && (
        <p className={styles.pageMeta}>
          Showing {(safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, items.length)} of {items.length}
        </p>
      )}
    </>
  );
}
