"use client";
import {useUI} from "@/i18n/useUI";
import { ExternalLink, Instagram } from "lucide-react";

export default function SourcePostButton({ url, variant = "default" }: { url?: string | null; variant?: "default" | "announcement" }) {
  const {t} = useUI();
  if (!url || !/^https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/$/.test(url)) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={variant === "announcement"
        ? "group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:border-pink-700 dark:hover:bg-pink-950/40 dark:hover:text-pink-300 vibrant:border-purple-200 vibrant:bg-white/80 vibrant:text-purple-800 vibrant:hover:bg-pink-50 sm:w-auto"
        : "my-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"}>
      {variant === "announcement" ? <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
      {t("Posta git")}
      {variant === "announcement" && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" aria-hidden="true" />}
    </a>
  );
}
