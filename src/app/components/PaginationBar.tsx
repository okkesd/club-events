"use client";
import {useUI} from "@/i18n/useUI";


import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "@/app/lib/types";

interface PaginationBarProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  const {t, locale} = useUI();
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={t("Previous page")}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 dark:text-gray-600">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-blue-600 dark:bg-blue-600 vibrant:bg-purple-600 text-white shadow-sm"
                : "border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 text-gray-700 dark:text-gray-300 vibrant:text-purple-700 hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 vibrant:border-purple-200 text-gray-600 dark:text-gray-400 vibrant:text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label={t("Next page")}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 vibrant:text-purple-500">
        {t(new Intl.PluralRules(locale).select(total) === "one" ? "{count} result" : "{count} results", {count: total.toLocaleString(locale)})}
      </span>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
