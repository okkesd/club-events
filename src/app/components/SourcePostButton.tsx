"use client";
import {useUI} from "@/i18n/useUI";
import { ExternalLink } from "lucide-react";

export default function SourcePostButton({ url }: { url?: string | null }) {
  const {t} = useUI();
  if (!url || !/^https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/$/.test(url)) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="my-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
      <ExternalLink className="h-4 w-4" aria-hidden="true" />  {t("Posta git")}</a>
  );
}
