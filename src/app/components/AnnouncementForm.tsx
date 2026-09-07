"use client";

import React, { useState } from "react";
import {
  Upload, Image as ImageIcon, Link as LinkIcon, Tag as TagIcon, X,
} from "lucide-react";
import { uploadImage, resolveImageUrl } from "@/app/lib/api";
import { AnnouncementCategory } from "@/app/lib/types";

const CATEGORIES: { value: AnnouncementCategory; label: string }[] = [
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
  { value: "scholarship", label: "Scholarship" },
  { value: "competition", label: "Competition" },
  { value: "recruitment", label: "Recruitment" },
  { value: "academic", label: "Academic" },
  { value: "workshop", label: "Workshop" },
  { value: "general", label: "General" },
];

const SUGGESTED_TAGS = [
  "engineering", "business", "design", "paid", "remote",
  "on-campus", "beginner-friendly", "graduate", "undergraduate", "deadline",
];

interface AnnouncementFormProps {
  initialData?: {
    title?: string;
    body?: string;
    coverImage?: string | null;
    link?: string;
    tags?: string[];
    category?: AnnouncementCategory;
    expiresAt?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function AnnouncementForm({ initialData, onSubmit, onCancel, isSubmitting }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    body: initialData?.body || "",
    coverImage: initialData?.coverImage || "",
    link: initialData?.link || "",
    tags: initialData?.tags || [] as string[],
    category: initialData?.category || "general" as AnnouncementCategory,
    expiresAt: initialData?.expiresAt || "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [expiryMode, setExpiryMode] = useState<"duration" | "date">("duration");
  const [duration, setDuration] = useState<"1d" | "3d" | "1w" | "2w">("1w"); // Default to 1 week

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14); // 14 days from today

  const minDateStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsUploading(true);
      const url = await uploadImage(e.target.files[0]);
      if (url) setFormData((prev) => ({ ...prev, coverImage: url }));
      setIsUploading(false);
    }
  };

  const calculateExpirationDate = (duration: "1d" | "3d" | "1w" | "2w"): string => {
    const date = new Date();
    
    if (duration === "1d") date.setDate(date.getDate() + 1);
    else if (duration === "3d") date.setDate(date.getDate() + 3);
    else if (duration === "1w") date.setDate(date.getDate() + 7);
    else if (duration === "2w") date.setDate(date.getDate() + 14);
  
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const TITLE_MAX = 200;
  const BODY_MAX = 10000;

  const titleOverLimit = formData.title.length > TITLE_MAX;
  const bodyOverLimit = formData.body.length > BODY_MAX;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleOverLimit || bodyOverLimit || isUploading) return;
  
    // 1. Calculate the exact YYYY-MM-DD date using your new helper and the 'duration' state
    // Grab the date based on whichever mode the user had active
    let finalExpiresAt;
    if (expiryMode === "duration") {
      finalExpiresAt = calculateExpirationDate(duration);
    } else {
      // If they chose 'date' but left it blank, fallback to 7 days
      finalExpiresAt = formData.expiresAt ? formData.expiresAt : calculateExpirationDate("1w");
    }
  
    // 2. Inject it into the payload
    const payload = {
      ...formData,
      expiresAt: finalExpiresAt, // <-- Overwrite with the calculated date
      link: formData.link || undefined,
      coverImage: formData.coverImage || null,
    };
    
    // 3. Send the perfectly formatted payload up to the parent page
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 transition-colors">Title</label>
          <span className={`text-xs ${titleOverLimit ? "text-red-500 font-bold" : "text-gray-400 dark:text-gray-500"}`}>
            {formData.title.length}/{TITLE_MAX}
          </span>
        </div>
        <input
          type="text"
          required
          maxLength={TITLE_MAX}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Summer Internship at Google"
          className={`w-full p-3 rounded-xl border transition-colors outline-none
            ${titleOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 vibrant:border-purple-200"}
            bg-white dark:bg-gray-800 vibrant:bg-white/80
            text-gray-900 dark:text-white vibrant:text-purple-900
            focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 vibrant:focus:ring-purple-500
            focus:border-blue-500 vibrant:focus:border-purple-500`}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 mb-2 transition-colors">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                formData.category === cat.value
                  ? "bg-blue-600 text-white vibrant:bg-purple-600 shadow-sm"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-500 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 transition-colors">Description</label>
          <span className={`text-xs ${bodyOverLimit ? "text-red-500 font-bold" : "text-gray-400 dark:text-gray-500"}`}>
            {formData.body.length}/{BODY_MAX}
          </span>
        </div>
        <textarea
          rows={6}
          required
          maxLength={BODY_MAX}
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          placeholder="Full details about this announcement..."
          className={`w-full p-3 rounded-xl border transition-colors outline-none resize-y
            ${bodyOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 vibrant:border-purple-200"}
            bg-white dark:bg-gray-800 vibrant:bg-white/80
            text-gray-900 dark:text-white vibrant:text-purple-900
            focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500
            focus:border-blue-500 vibrant:focus:border-purple-500`}
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 mb-2 transition-colors">Cover Image</label>
        <div className="flex items-center gap-4">
          {formData.coverImage ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group transition-colors">
              <img src={resolveImageUrl(formData.coverImage)} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                disabled={isUploading || isSubmitting}
                onClick={() => setFormData({ ...formData, coverImage: "" })}
                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-50 dark:bg-gray-800 vibrant:bg-purple-50 border-2 border-dashed border-gray-300 dark:border-gray-700 vibrant:border-purple-300 flex items-center justify-center text-gray-400 dark:text-gray-600 vibrant:text-purple-400 transition-colors">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors shadow-sm
            bg-white text-gray-700 border-gray-300 hover:bg-gray-50
            dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700
            vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-700 vibrant:hover:bg-purple-50">
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload"}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* External Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 mb-2 transition-colors">
          <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> External Link (optional)</span>
        </label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          placeholder="https://..."
          className="w-full p-3 rounded-xl border transition-colors outline-none
            border-gray-200 dark:border-gray-700 vibrant:border-purple-200
            bg-white dark:bg-gray-800 vibrant:bg-white/80
            text-gray-900 dark:text-white vibrant:text-purple-900
            focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500
            focus:border-blue-500 vibrant:focus:border-purple-500"
        />
      </div>

      {/* Expiration Settings */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 vibrant:text-purple-900 transition-colors">
          How long should this be visible?
        </label>

        {/* The Switch (Segmented Control) */}
        <div className="flex bg-gray-100 dark:bg-gray-800 vibrant:bg-purple-100/50 p-1 rounded-xl w-full max-w-sm transition-colors">
          <button
            type="button"
            onClick={() => setExpiryMode("duration")}
            className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all ${
              expiryMode === "duration"
                ? "bg-white dark:bg-gray-700 vibrant:bg-white text-gray-900 dark:text-white vibrant:text-purple-900 shadow-sm"
                : "text-gray-500 dark:text-gray-400 vibrant:text-purple-600 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Quick Presets
          </button>
          <button
            type="button"
            onClick={() => setExpiryMode("date")}
            className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all ${
              expiryMode === "date"
                ? "bg-white dark:bg-gray-700 vibrant:bg-white text-gray-900 dark:text-white vibrant:text-purple-900 shadow-sm"
                : "text-gray-500 dark:text-gray-400 vibrant:text-purple-600 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            Custom Date
          </button>
        </div>

        {/* Conditional Rendering based on the switch */}
        {expiryMode === "duration" ? (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border transition-all outline-none
                         bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-blue-500
                         vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-900 vibrant:focus:border-purple-500"
            >
              <option value="1d">1 Day (Quick update)</option>
              <option value="3d">3 Days (Short notice)</option>
              <option value="1w">1 Week (Standard)</option>
              <option value="2w">2 Weeks (Maximum visibility)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mt-2">
              Announcements auto-hide after this period to keep the feed fresh.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <input
              type="date"
              min={minDateStr} // Prevent selecting past dates
              max={maxDateStr} // Prevent selecting past 14 days
              value={formData.expiresAt || ""}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border transition-all outline-none
                         bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                         dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-blue-500
                         vibrant:bg-white/80 vibrant:border-purple-200 vibrant:text-purple-900 vibrant:focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 vibrant:text-purple-500 mt-2">
              Custom expiration date cannot exceed 14 days from today.
            </p>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-purple-700 mb-2 transition-colors">
          <span className="flex items-center gap-1.5"><TagIcon className="w-4 h-4" /> Tags</span>
        </label>

        {/* Current tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 vibrant:bg-purple-100 vibrant:text-purple-700"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Type a tag and press Enter..."
          className="w-full p-3 rounded-xl border transition-colors outline-none mb-2
            border-gray-200 dark:border-gray-700 vibrant:border-purple-200
            bg-white dark:bg-gray-800 vibrant:bg-white/80
            text-gray-900 dark:text-white vibrant:text-purple-900
            focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-purple-500
            focus:border-blue-500 vibrant:focus:border-purple-500"
        />

        {/* Suggested tags */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_TAGS.filter((t) => !formData.tags.includes(t)).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 vibrant:bg-purple-50 vibrant:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-purple-100 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 vibrant:border-purple-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 vibrant:text-purple-600 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-purple-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 vibrant:bg-purple-600 vibrant:hover:bg-purple-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Publish"}
        </button>
      </div>
    </form>
  );
}
