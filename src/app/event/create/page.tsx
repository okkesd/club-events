"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import this
import { 
  Calendar, Clock, MapPin, Upload, Image as ImageIcon, 
  Type, Map, Users, Link as LinkIcon, Eye 
} from 'lucide-react';
import { uploadImage } from '@/app/lib/api'; 

// --- MOCK DATA FOR GHOST USER ---
const CLUBS = [
  { id: "123", name: "Coding Club" },
  { id: "456", name: "Robotics Club" },
  { id: "457", name: "Astronomy Club" }
];

const CAMPUS_LOCATIONS = ["Tech Hall", "Student Center", "Library 304", "Engineering Lab"];
const PREDEFINED_TAGS = ["Workshop", "Social", "Free Food", "Career", "Competition", "Lecture"];

export default function CreateEventPage() {
  const [isUploading, setIsUploading] = useState(false);
  const searchParams = useSearchParams();
  const preselectedClubId = searchParams.get('preselect');
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    clubId: preselectedClubId || "123", // Default to first club
    title: "",
    description: "",
    coverImage: "", // URL from backend
    
    // Date & Time
    date: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
    startTime: "10:00",
    timeMode: "duration" as "duration" | "endTime",
    duration: 1.0,
    endTime: "11:00",
    
    // Location
    locationType: "on-campus" as "on-campus" | "off-campus",
    location: "",
    
    // Details
    tags: [] as string[],
    isRegistrationRequired: false,
    capacity: 0,
    registrationLink: ""
  });

  // --- TIME CALCULATION LOGIC ---
  useEffect(() => {
    // Whenever startTime or duration changes, update endTime automatically
    if (formData.timeMode === 'duration') {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + (formData.duration * 60);
      
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMins = Math.floor(totalMinutes % 60);
      
      const formattedEnd = `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
      
      // Only update if different to avoid infinite loops
      if (formattedEnd !== formData.endTime) {
        setFormData(prev => ({ ...prev, endTime: formattedEnd }));
      }
    }
  }, [formData.startTime, formData.duration, formData.timeMode]);

  // --- HANDLERS ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const url = await uploadImage(file);
      if (url) {
        setFormData(prev => ({ ...prev, coverImage: url }));
      }
      setIsUploading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      }
      if (prev.tags.length >= 3) return prev; // Limit to 3 tags
      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("This would send the JSON to your backend now!\n\n" + JSON.stringify(formData, null, 2));
    // Here call createEvent(formData)
  };

  // --- RENDER HELPERS ---
  // Calculates display date for preview
  const getPreviewDateParts = () => {
    if (!formData.date) return { month: 'JAN', day: '18' }; // Fallback
    
    const [year, month, day] = formData.date.split('-').map(Number);
    // Create date using local arguments (Month is 0-indexed: 0=Jan)
    const dateObj = new Date(year, month - 1, day);
    
    return {
        month: dateObj.toLocaleString('default', { month: 'short' }).toUpperCase(),
        day: day // Use the raw number from input to be 100% sure
    };
  };

  const { month: previewMonth, day: previewDay } = getPreviewDateParts();
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
            
            {/* GHOST USER SELECTOR */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-500 font-medium">Posting as:</span>
                <select 
                    value={formData.clubId}
                    onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                    className="bg-transparent font-bold text-gray-900 border-none focus:ring-0 p-0 cursor-pointer"
                >
                    {CLUBS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: THE FORM (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1: BASICS */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Type className="w-5 h-5 text-blue-600" />
                        Basic Info
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Intro to React Workshop"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                        <div className="flex items-center gap-4">
                            {formData.coverImage ? (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, coverImage: ""})}
                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Upload className="w-4 h-4" />
                                    {isUploading ? "Uploading..." : "Upload Image"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Recommended: 1200x600px. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: TIME & PLACE */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Time & Place
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full p-2.5 rounded-xl border border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input 
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={e => setFormData({...formData, startTime: e.target.value})}
                                className="w-full p-2.5 rounded-xl border border-gray-200"
                            />
                        </div>
                    </div>

                    {/* DURATION vs END TIME TOGGLE */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="timeMode" 
                                    checked={formData.timeMode === 'duration'}
                                    onChange={() => setFormData({...formData, timeMode: 'duration'})}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Set Duration</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="timeMode" 
                                    checked={formData.timeMode === 'endTime'}
                                    onChange={() => setFormData({...formData, timeMode: 'endTime'})}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Set End Time</span>
                            </label>
                        </div>

                        {formData.timeMode === 'duration' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Duration (Hours)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        min="0.5"
                                        max="12"
                                        value={formData.duration}
                                        onChange={e => setFormData({...formData, duration: parseFloat(e.target.value)})}
                                        className="w-32 p-2.5 rounded-xl border border-gray-200"
                                    />
                                    <span className="text-sm text-gray-500">
                                        Ends at <span className="font-bold text-gray-900">{formData.endTime}</span>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">End Time</label>
                                <input 
                                    type="time" 
                                    value={formData.endTime}
                                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                                    className="w-32 p-2.5 rounded-xl border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* LOCATION */}
                    <div>
                        <div className="flex gap-4 mb-3">
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, locationType: 'on-campus'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                    formData.locationType === 'on-campus' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                             >
                                On Campus
                             </button>
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, locationType: 'off-campus'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                    formData.locationType === 'off-campus' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                             >
                                Off Campus
                             </button>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formData.locationType === 'on-campus' ? "Room / Building" : "Address / Venue"}
                        </label>
                        <input 
                            type="text"
                            required
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder={formData.locationType === 'on-campus' ? "e.g. Room 101, Tech Hall" : "e.g. 123 Main St, Downtown"}
                            className="w-full p-3 rounded-xl border border-gray-200 mb-2"
                        />

                        {/* Quick Select Buttons (Only for On Campus) */}
                        {formData.locationType === 'on-campus' && (
                            <div className="flex flex-wrap gap-2">
                                {CAMPUS_LOCATIONS.map(loc => (
                                    <button
                                        key={loc}
                                        type="button"
                                        onClick={() => setFormData({...formData, location: loc})}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3: DETAILS */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Map className="w-5 h-5 text-purple-600" />
                        Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            rows={4}
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Tell students what makes this event awesome..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Max 3)</label>
                        <div className="flex flex-wrap gap-2">
                            {PREDEFINED_TAGS.map(tag => {
                                const isSelected = formData.tags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            isSelected 
                                            ? 'bg-gray-900 text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="pt-4">
                    <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                        Publish Event
                    </button>
                </div>

            </form>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW (5 cols) ================= */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-8 space-y-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                </div>

                {/* --- THE PREVIEW CARD --- */}
                {/* This mimics your main EventCard component */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 pointer-events-none select-none transform transition-all hover:scale-[1.02]">
                    
                    {/* Image Area */}
                    <div className="h-48 bg-gray-200 relative">
                        {formData.coverImage ? (
                            <img src={formData.coverImage} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm">No Image Selected</span>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-800">
                                {CLUBS.find(c => c.id === formData.clubId)?.name}
                            </span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                                    {formData.title || "Your Event Title"}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 h-10">
                                    {formData.description || "Description will appear here..."}
                                </p>
                            </div>
                            {/* Date Box */}
                            <div className="flex flex-col items-center justify-center bg-blue-50 w-14 h-14 rounded-xl border border-blue-100 shrink-0 ml-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">{previewMonth}</span>
                                <span className="text-lg font-extrabold text-gray-900">{previewDay}</span>
                            </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{formData.startTime} - {formData.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{formData.location || "Location TBD"}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                            {formData.tags.length > 0 ? (
                                formData.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wide">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-wide">
                                    No Tags
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 px-8">
                    This is how your event will appear on the main feed and weekly calendar.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}