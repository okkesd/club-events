import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import SubscribeForm from "@/app/components/SubscribeForm";
import { getUI } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getUI();
  const title = `${t("Weekly newsletter")} | Evenements`;
  const description = t("Get a weekly email with last week's announcements and upcoming events for the next week.");

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function SubscribePage() {
  const { t } = await getUI();

  return (
    <div className="flex grow items-center justify-center bg-gray-50 px-4 py-10 transition-colors dark:bg-gray-950 vibrant:bg-transparent sm:px-6 sm:py-12">
      <section aria-labelledby="newsletter-title" className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl transition-colors dark:border-gray-800 dark:bg-gray-900 vibrant:border-purple-200 vibrant:bg-white/80 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 vibrant:bg-purple-100">
            <Mail aria-hidden="true" className="h-7 w-7 text-blue-600 dark:text-blue-400 vibrant:text-purple-600" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 vibrant:text-purple-600">Evenements</p>
          <h1 id="newsletter-title" className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white vibrant:text-purple-900">
            {t("Weekly newsletter")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 vibrant:text-purple-600">
            {t("Get a weekly email with last week's announcements and upcoming events for the next week.")}
          </p>
          <p className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400 vibrant:text-purple-500">
            {t("No account needed. Just your email address.")}
          </p>
        </div>

        <SubscribeForm layout="stacked" />

        <div className="mt-6 border-t border-gray-100 pt-5 text-center dark:border-gray-800 vibrant:border-purple-100">
          <Link href="/events" className="inline-flex items-center gap-2 rounded text-sm font-medium text-blue-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 dark:text-blue-400 vibrant:text-purple-600">
            {t("Browse Events")}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
