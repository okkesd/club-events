"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, Heart, Megaphone } from "lucide-react";
import { useUI } from "@/i18n/useUI";

const items = [
  { href: "/main", label: "Calendar", icon: CalendarDays },
  { href: "/events", label: "Events", icon: LayoutGrid },
  { href: "/my-likes", label: "My Likes", icon: Heart },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useUI();

  return (
    <div className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden">
      <nav
        aria-label={t("Mobile navigation")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-800 dark:bg-gray-900 vibrant:border-campus-border vibrant:bg-white"
      >
        <div className="grid h-16 grid-cols-4">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-center text-[11px] leading-tight transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 ${active
                  ? "font-semibold text-blue-600 dark:text-blue-300 vibrant:text-campus-accent-dark"
                  : "font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 vibrant:text-campus-accent vibrant:hover:text-campus-accent-dark"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 1.75} aria-hidden="true" />
                <span>{t(label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
