"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Upload, Image as ImageIcon, Type, Map 
} from 'lucide-react';
import { uploadImage, resolveImageUrl } from '@/app/lib/api';

interface EventFormProps {
    initialData?: any; // If provided, we are in Edit Mode
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isSubmitting: boolean;
}

export default function EventForm({ initialData, onSubmit, onCancel, isSubmitting }: EventFormProps) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        coverImage: initialData?.coverImage || "",
        date: initialData?.date || new Date().toISOString().split('T')[0],
        startTime: initialData?.startTime || "10:00",
        endTime: initialData?.endTime || "11:00",
        duration: initialData?.duration || 1.0,
        locationType: initialData?.locationType || "on-campus",
        location: initialData?.location || "",
        // Assuming timeMode is derived for edits, or default to duration
        timeMode: "duration" as "duration" | "endTime", 
    });

    const [isUploading, setIsUploading] = useState(false);

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
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Event" : "Create Event"}</h2>
            
            {/* Title */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Event Title</label>
                    <span className={`text-xs ${titleOverLimit ? "text-red-500 font-bold" : "text-gray-400"}`}>
                        {formData.title.length}/{TITLE_MAX}
                    </span>
                </div>
                <input
                    type="text" required value={formData.title}
                    maxLength={TITLE_MAX}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${titleOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200"}`}
                />
            </div>

            {/* Image */}
            <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden relative">
                    {formData.coverImage ? (
                        <img src={resolveImageUrl(formData.coverImage)} className="w-full h-full object-cover" />
                    ) : <ImageIcon className="w-8 h-8 text-gray-400 m-auto mt-8" />}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg font-bold text-sm">
                    {isUploading ? "..." : "Change Image"}
                    <input type="file" className="hidden" onChange={handleImageChange} />
                </label>
            </div>

            {/* Description */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <span className={`text-xs ${descOverLimit ? "text-red-500 font-bold" : "text-gray-400"}`}>
                        {formData.description.length}/{DESC_MAX}
                    </span>
                </div>
                <textarea
                    rows={4} required value={formData.description}
                    maxLength={DESC_MAX}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${descOverLimit ? "border-red-400 focus:ring-red-300" : "border-gray-200"}`}
                />
            </div>

            {/* Time & Place (Simplified for brevity) */}
            <div className="grid grid-cols-2 gap-4">
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-3 border rounded-xl" />
                <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="p-3 border rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.5" value={formData.duration} onChange={e => setFormData({...formData, duration: parseFloat(e.target.value)})} className="p-3 border rounded-xl" placeholder="Duration (hrs)" />
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="p-3 border rounded-xl" placeholder="Location" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}