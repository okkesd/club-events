"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { subscribe } from "@/app/lib/api";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribe({ email });
      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to subscribe");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 vibrant:bg-green-50 border border-green-200 dark:border-green-800 vibrant:border-green-200 transition-colors">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          Subscribed! Check your email for a confirmation link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors outline-none text-sm
              border-gray-200 dark:border-gray-700 vibrant:border-purple-200
              bg-white dark:bg-gray-800 vibrant:bg-white/80
              text-gray-900 dark:text-white vibrant:text-purple-900
              focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 vibrant:focus:ring-purple-200
              focus:border-blue-500 vibrant:focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}
    </form>
  );
}
