"use client";
import {useUI} from "@/i18n/useUI";


import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Upload, Image as ImageIcon, Type, Map, Users, Link2
} from 'lucide-react';
import { uploadImage, resolveImageUrl } from '@/app/lib/api';
import OrganizerInstagramField from './OrganizerInstagramField';
import EventCategoryField from './EventCategoryField';
import EventMarkdown from './EventMarkdown';

interface EventFormProps {
    initialData?: any; // If provided, we are in Edit Mode
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isSubmitting: boolean;
}

export default function EventForm({ initialData, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const {t} = useUI();
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        organizerInstagram: initialData?.organizerInstagram || "",
        category: initialData?.categoryOverride || "",
        description: initialData?.description || "",
        coverImage: initialData?.coverImage || "",
        date: initialData?.date || new Date().toISOString().split('T')[0],
        startTime: initialData?.startTime || "10:00",
        endTime: initialData?.endTime || "11:00",
        duration: initialData?.duration || 1.0,
        locationType: initialData?.locationType || "on-campus",
        location: initialData?.location || "",
        isRegistrationOpen: initialData?.isRegistrationOpen ?? false,
        registrationLink: initialData?.registrationLink || "",
        capacity: initialData?.capacity ?? 0,
        // Assuming timeMode is derived for edits, or default to duration
        timeMode: "duration" as "duration" | "endTime",
    });

    const [isUploading, setIsUploading] = useState(false);
    const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);

    // Time Calculation Logic (Same as Create Page)
    useEffect(() => {
        if (formData.timeMode === 'duration') {
            const [hours, minutes] = formData.startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + (formData.duration * 60);
            const newHours = Math.floor(totalMinutes / 60) % 24;
            const newMins = Math.floor(totalMinutes % 60);
            const formattedEnd = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
            
            if (formattedEnd !== formData.endTime) {
                setFormData(prev => ({ ...prev, endTime: formattedEnd }));
            }
        }
    }, [formData.startTime, formData.duration, formData.timeMode]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setIsUploading(true);
            const url = await uploadImage(e.target.files[0]);
            if (url) setFormData(prev => ({ ...prev, coverImage: url }));
            setIsUploading(false);
        }
    };

    const TITLE_MAX = 200;
    const DESC_MAX = 5000;

    const titleOverLimit = formData.title.length > TITLE_MAX;
    const descOverLimit = formData.description.length > DESC_MAX;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (titleOverLimit || descOverLimit) return;
        // timeMode only drives the endTime calculation above — it isn't part of
        // the API schema, so keep it out of the request body.
        const { timeMode, ...payload } = formData;
        onSubmit({ ...payload, category: payload.category || null, organizerInstagram: payload.organizerInstagram.trim().replace(/^@+/, '').trim() || null });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 vibrant:bg-white/80 vibrant:backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-800 vibrant:border-campus-border shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-4 transition-colors">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white vibrant:text-gray-900">{initialData ? t("Edit Event") : t("Create Event")}</h2>
            
            {/* Title */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink">{t("Event Title")}</label>
                    <span className={`text-xs ${titleOverLimit ? "text-red-500 font-bold" : "text-gray-400 dark:text-gray-500 vibrant:text-campus-muted"}`}>
                        {formData.title.length}/{TITLE_MAX}
                    </span>
                </div>
                <input
                    type="text" required value={formData.title}
                    maxLength={TITLE_MAX}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className={`w-full p-3 rounded-xl border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-900 dark:text-white vibrant:text-gray-900 transition-colors ${titleOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 vibrant:border-campus-border"}`}
                />
            </div>

            {/* Image */}
            <EventCategoryField value={formData.category} onChange={category => setFormData(prev => ({ ...prev, category }))} />
            <OrganizerInstagramField value={formData.organizerInstagram} onChange={organizerInstagram => setFormData(prev => ({ ...prev, organizerInstagram }))} />
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 vibrant:bg-campus-soft overflow-hidden relative transition-colors">
                    {formData.coverImage ? (
                        <img src={resolveImageUrl(formData.coverImage)} className="w-full h-full object-cover" />
                    ) : <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 vibrant:text-campus-muted m-auto mt-8" />}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-800 vibrant:bg-campus-soft text-gray-700 dark:text-gray-300 vibrant:text-campus-ink rounded-lg font-bold text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 vibrant:hover:bg-campus-soft">
                    {isUploading ? "..." : t("Change Image")}
                    <input type="file" className="hidden" onChange={handleImageChange} />
                </label>
            </div>

            {/* Description */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink">{t("Description")}</label>
                    <span className={`text-xs ${descOverLimit ? "text-red-500 font-bold" : "text-gray-400 dark:text-gray-500 vibrant:text-campus-muted"}`}>
                        {formData.description.length}/{DESC_MAX}
                    </span>
                </div>
                <textarea
                    rows={4} required value={formData.description}
                    maxLength={DESC_MAX}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className={`w-full p-3 rounded-xl border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-900 dark:text-white vibrant:text-gray-900 transition-colors ${descOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 vibrant:border-campus-border"}`}
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{t("Markdown supported: **bold**, *italic*, lists and links.")}</span>
                    <button type="button" onClick={() => setShowDescriptionPreview(value => !value)} className="font-medium text-blue-600 dark:text-blue-300 underline">
                        {showDescriptionPreview ? t("Hide preview") : t("Preview Markdown")}
                    </button>
                </div>
                {showDescriptionPreview && <div className="mt-3 min-h-16 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-gray-700 dark:text-gray-200"><EventMarkdown text={formData.description} /></div>}
            </div>

            {/* Time & Place (Simplified for brevity) */}
            <div className="grid grid-cols-2 gap-4">
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-3 border rounded-xl border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-900 dark:text-white vibrant:text-gray-900 transition-colors" />
                <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="p-3 border rounded-xl border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-900 dark:text-white vibrant:text-gray-900 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.5" value={formData.duration} onChange={e => setFormData({...formData, duration: parseFloat(e.target.value)})} className="p-3 border rounded-xl border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-900 dark:text-white vibrant:text-gray-900 transition-colors" placeholder={t("Duration (hrs)")} />
            </div>

            {/* Location Type */}
            <div>
                <div className="flex gap-4 mb-3">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, locationType: 'on-campus'})}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer border ${
                            formData.locationType === 'on-campus'
                            ? 'bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50 vibrant:bg-campus-soft vibrant:text-campus-ink vibrant:border-campus-border'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 vibrant:bg-white/70 vibrant:border-campus-border vibrant:text-campus-ink vibrant:hover:bg-campus-surface'
                        }`}
                    >
                        {t("On Campus")}</button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, locationType: 'off-campus'})}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer border ${
                            formData.locationType === 'off-campus'
                            ? 'bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50 vibrant:bg-campus-soft vibrant:text-campus-ink vibrant:border-campus-border'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 vibrant:bg-white/70 vibrant:border-campus-border vibrant:text-campus-ink vibrant:hover:bg-campus-surface'
                        }`}
                    >
                        {t("Off Campus")}</button>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink mb-1">
                    {formData.locationType === 'on-campus' ? t("Room / Building") : t("Address / Venue")}
                </label>
                <input
                    type="text" required value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder={formData.locationType === 'on-campus' ? t("e.g. Room 101, Tech Hall") : t("e.g. 123 Main St, Downtown")}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-700 dark:text-white vibrant:text-gray-900 transition-colors"
                />
            </div>

            {/* Registration */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isRegistrationOpen}
                            onChange={(e) => setFormData({...formData, isRegistrationOpen: e.target.checked})}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink">{t("Enable registration")}</span>
                </div>

                {formData.isRegistrationOpen && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink mb-1">{t("Registration Link")}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Link2 className="h-4 w-4 text-gray-400 dark:text-gray-500 vibrant:text-campus-muted" />
                                </div>
                                <input
                                    type="url"
                                    placeholder="https://forms.google.com/..."
                                    value={formData.registrationLink}
                                    onChange={(e) => setFormData({...formData, registrationLink: e.target.value})}
                                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-700 dark:text-white vibrant:text-gray-900 dark:placeholder-gray-500 vibrant:placeholder-campus-muted focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-campus-accent transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 vibrant:text-campus-ink mb-1">{t("Capacity")} <span className="text-gray-400 dark:text-gray-500 vibrant:text-campus-muted font-normal">{t("(0 = unlimited)")}</span></label>
                            <input
                                type="number"
                                min="0"
                                value={formData.capacity}
                                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                                className="w-40 p-3 rounded-xl border border-gray-200 dark:border-gray-700 vibrant:border-campus-border bg-white dark:bg-gray-800 vibrant:bg-white/70 text-gray-700 dark:text-white vibrant:text-gray-900 focus:ring-2 focus:ring-blue-500 vibrant:focus:ring-campus-accent transition-colors"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 vibrant:border-campus-border transition-colors">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 vibrant:text-campus-ink font-bold hover:bg-gray-100 dark:hover:bg-gray-800 vibrant:hover:bg-campus-soft rounded-xl transition-colors">
                        {t("Cancel")}</button>
                )}
                <button
                    type="submit" disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 dark:bg-blue-600 vibrant:bg-gradient-to-r vibrant:from-campus-accent vibrant:to-campus-accent text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 vibrant:hover:from-campus-accent-dark vibrant:hover:to-campus-accent-dark disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? t("Saving...") : t("Save Changes")}
                </button>
            </div>
        </form>
    );
}
