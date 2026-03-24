"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { unsubscribe } from "@/app/lib/api";

export default function UnsubscribePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    unsubscribe(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMsg(err.message || "Failed to unsubscribe");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 vibrant:bg-transparent flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 vibrant:text-purple-500 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 vibrant:text-purple-600 font-medium">Processing your request...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">
              Unsubscribed
            </h1>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
              You have been successfully unsubscribed from email notifications.
            </p>
            <Link
              href="/main"
              className="inline-block mt-4 px-6 py-2.5 bg-blue-600 vibrant:bg-purple-600 text-white font-bold rounded-xl hover:bg-blue-700 vibrant:hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white vibrant:text-purple-900 transition-colors">
              Something went wrong
            </h1>
            <p className="text-gray-500 dark:text-gray-400 vibrant:text-purple-500 transition-colors">
              {errorMsg || "The unsubscribe link may be invalid or expired."}
            </p>
            <Link
              href="/main"
              className="inline-block mt-4 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 vibrant:bg-purple-600 text-white dark:text-gray-900 vibrant:text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 vibrant:hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
