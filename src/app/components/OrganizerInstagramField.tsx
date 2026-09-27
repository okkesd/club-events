"use client";

import { useUI } from "@/i18n/useUI";

export default function OrganizerInstagramField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useUI();
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink">
      {t("Organizer Instagram (optional)")}
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="@instagram"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white vibrant:border-campus-border vibrant:bg-white/70 vibrant:text-gray-900"
      />
    </label>
  );
}
