"use client";
import {useUI} from "@/i18n/useUI";


import React, { useId, useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { subscribe } from "@/app/lib/api";
import { AnnouncementCategory } from "@/app/lib/types";

interface SubscribeFormProps {
  selectedCategories?: AnnouncementCategory[];
  layout?: "inline" | "stacked";
}

export default function SubscribeForm({ selectedCategories = [], layout = "inline" }: SubscribeFormProps) {
  const {t, errorText} = useUI();
  const formId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleSubscribeClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !agreedToPrivacy || status === "loading") return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!agreedToPrivacy || status === "loading") return;
    setShowConfirm(false);
    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribe({ email: email.trim(), categories: selectedCategories });
      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to subscribe");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 vibrant:bg-green-50 border border-green-200 dark:border-green-800 vibrant:border-green-200 transition-colors">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          {t("Subscribed! You'll receive a weekly digest of announcements and upcoming events.")}</p>
      </div>
    );
  }

  const categoryLabel = selectedCategories.length > 0
    ? selectedCategories.map((c) => t(c)).join(", ")
    : null;

  return (
    <>
      <form onSubmit={handleSubscribeClick} className="space-y-3">
        <label htmlFor={`${formId}-email`} className={layout === "stacked" ? "block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700" : "sr-only"}>
          {t("Your Email")}
        </label>
        <div className={`flex gap-2 ${layout === "stacked" ? "flex-col" : ""}`}>
          <div className="relative min-w-0 flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              id={`${formId}-email`}
              name="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              disabled={status === "loading"}
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors outline-none text-base sm:text-sm
                border-gray-200 dark:border-gray-700 vibrant:border-purple-200
                bg-white dark:bg-gray-800 vibrant:bg-white/80
                text-gray-900 dark:text-white vibrant:text-purple-900
                focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 vibrant:focus:ring-purple-200
                focus:border-blue-500 vibrant:focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || !agreedToPrivacy}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {status === "loading" ? "..." : t("Subscribe")}
          </button>
        </div>
        <div className="flex items-start gap-2">
          <input
            id={`${formId}-privacy`}
            type="checkbox"
            required
            disabled={status === "loading"}
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 vibrant:text-purple-600 vibrant:focus:ring-purple-500"
          />
          <label htmlFor={`${formId}-privacy`} className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500">
            {t("I have read and accept the")}{" "}
            <Link href="/legal/privacy" className="text-blue-600 dark:text-blue-400 vibrant:text-pink-600 hover:underline">
              {t("Privacy Policy")}</Link>
          </label>
        </div>
        {status === "error" && (
          <div role="alert" className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorText(errorMsg)}
          </div>
        )}
      </form>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-transparent dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("Confirm Subscription")}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {categoryLabel
                  ? t("You will receive weekly emails with announcements from {categories} and upcoming events.", {categories: categoryLabel})
                  : t("You will receive weekly emails with all announcement categories and upcoming events.")}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                {t("Cancel")}</button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
              >
                {t("Confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
