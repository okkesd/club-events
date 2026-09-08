"use client";
import {useUI} from "@/i18n/useUI";


import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail, AlertTriangle } from "lucide-react";
import { unsubscribe } from "@/app/lib/api";

export default function UnsubscribePage() {
  const {t, errorText} = useUI();
  const { token } = useParams<{ token: string }>();
  // Changed initial state to "idle"
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Moved the API call into a button click handler
  const handleUnsubscribe = async () => {
    if (!token) return;
    setStatus("loading");
    
    try {
      await unsubscribe(token);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to unsubscribe");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full text-center">
        
        {/* NEW: Idle State (Waiting for human confirmation) */}
        {status === "idle" && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 vibrant:bg-purple-100 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400 vibrant:text-purple-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors mb-2">
                {t("Unsubscribe from updates?")}</h1>
              <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
                {t("Click the button below to confirm you want to stop receiving these emails.")}</p>
            </div>

            <button
              onClick={handleUnsubscribe}
              className="w-full inline-block px-6 py-3.5 bg-red-600 vibrant:bg-pink-600 text-white font-bold rounded-xl hover:bg-red-700 vibrant:hover:bg-pink-700 transition-colors shadow-sm"
            >
              {t("Confirm Unsubscribe")}</button>
          </div>
        )}

        {/* Loading State */}
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 vibrant:text-purple-500 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 vibrant:text-purple-600 font-medium">{t("Processing your request...")}</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">
              {t("Unsubscribed")}</h1>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
              {t("You have been successfully unsubscribed from email notifications.")}</p>
            <Link
              href="/main"
              className="inline-block mt-4 px-6 py-2.5 bg-blue-600 vibrant:bg-purple-600 text-white font-bold rounded-xl hover:bg-blue-700 vibrant:hover:bg-purple-700 transition-colors shadow-sm"
            >
              {t("Back to Home")}</Link>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">
              {t("Something went wrong")}</h1>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
              {(errorMsg ? errorText(errorMsg) : "") || t("The unsubscribe link may be invalid or expired.")}
            </p>
            <Link
              href="/main"
              className="inline-block mt-4 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 vibrant:bg-purple-600 text-white dark:text-gray-900 vibrant:text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 vibrant:hover:bg-purple-700 transition-colors shadow-sm"
            >
              {t("Back to Home")}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
