"use client";

import { Globe, ChevronDown } from "lucide-react";
import {useTransition} from "react";
import {useRouter} from "next/navigation";
import {useUI} from "@/i18n/useUI";
import {isLocale, localeCookie} from "@/i18n/config";



interface LanguageSelectorProps {
  expanded?: boolean;
}

export default function LanguageSelector({ expanded = false }: LanguageSelectorProps) {
  const {t, language} = useUI();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const changeLanguage = (value: string) => {
    if (!isLocale(value) || value === language) return;
    document.cookie = `${localeCookie}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    startTransition(() => router.refresh());
  };
  return (
    <label className={`relative flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 vibrant:text-purple-700 hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-50 focus-within:ring-2 focus-within:ring-blue-500 transition-colors ${expanded ? "w-full px-3" : "px-2"}`}>
      <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
      {expanded && <span>{t("Language")}</span>}
      <span className={expanded ? "ml-auto uppercase" : "uppercase"}>{language}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <select
        aria-label={t("Language")}
        disabled={pending}
        aria-busy={pending}
        value={language}
        onChange={(event) => changeLanguage(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="tr" lang="tr">Türkçe</option>
        <option value="en" lang="en">English</option>
        <option value="fr" lang="fr">Français</option>
      </select>
    </label>
  );
}
