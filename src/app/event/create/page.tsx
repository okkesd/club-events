"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, Upload, Image as ImageIcon, 
  Type, Map, Eye, Smartphone, Monitor 
} from 'lucide-react';
import { createEvent, uploadImage, getAllClubs } from '@/app/lib/api'; 
import { ClubData } from '@/app/lib/types';


const CAMPUS_LOCATIONS = ["Tech Hall", "Student Center", "Library 304", "Engineering Lab"];
const PREDEFINED_TAGS = ["Workshop", "Social", "Free Food", "Career", "Competition", "Lecture"];
// little change 
function CreateEventSuspended() {
  const router = useRouter(); // Initialize router
  const searchParams = useSearchParams();
  const preselectedClubId = searchParams.get('preselect');
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [clubs, setClubs] = useState<ClubData[]|null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    clubId: preselectedClubId || "123",
    title: "",
    description: "",
    coverImage: "", 
    date: new Date().toISOString().split('T')[0],
    startTime: "10:00",
    timeMode: "duration" as "duration" | "endTime",
    duration: 1.0,
    endTime: "11:00",
    locationType: "on-campus" as "on-campus" | "off-campus",
    location: "",
    tags: [] as string[],
    isRegistrationRequired: false,
    capacity: 0,
    registrationLink: ""
  });

  // Fetch clubs
  useEffect(() => {
    getAllClubs().then((data) => setClubs(data));
  }, []);

  // --- TIME CALCULATION LOGIC ---
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

  // --- HANDLERS ---
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const url = await uploadImage(file);
        if (url) {
            setFormData(prev => ({ ...prev, coverImage: url }));
        }
      } catch (err) {
        alert("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      }
      if (prev.tags.length >= 3) return prev; 
      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    // 1. Basic Required Fields
    if (!formData.title.trim()) {
        newErrors.title = "Event title is required";
        isValid = false;
    }
    if (!formData.description.trim()) {
        newErrors.description = "Description is required";
        isValid = false;
    }
    if (!formData.location.trim()) {
        newErrors.location = "Location is required";
        isValid = false;
    }

    // 2. Time Logic Check
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Check if end time is effectively before start time (simple check, doesn't account for overnight events yet)
    if (endTotal <= startTotal) {
        newErrors.endTime = "End time must be after start time";
        isValid = false;
    }

    // 3. Date Check
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) {
        newErrors.date = "Cannot create events in the past";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Run Validation
    if (!validateForm()) {
        // Simple alert to notify user to look for red fields
        alert("Please fix the highlighted errors.");
        return; 
    }

    setIsSubmitting(true);
    
    try {
        // 2. Call API
        const response = await createEvent(formData);

        // 3. Check Success Flag
        if (response.success && response.data) {
            alert("Event Created Successfully!");
            router.push("/main"); 
        } else {
            alert(`Failed: ${response.errorMsg || "Unknown error"}`);
        }
        
    } catch (error: any) {
        console.error(error);
        alert(`Server Error: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // Helper to clear errors when user types
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // --- RENDER HELPERS ---
  const getPreviewDateParts = () => {
    if (!formData.date) return { month: 'JAN', day: '18' }; 
    const [year, month, day] = formData.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return {
        month: dateObj.toLocaleString('default', { month: 'short' }).toUpperCase(),
        day: day 
    };
  };

  const { month: previewMonth, day: previewDay } = getPreviewDateParts();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-500 font-medium">Posting as:</span>
                <select 
                    value={formData.clubId}
                    onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                    className="bg-transparent font-bold text-gray-900 border-none focus:ring-0 p-0 cursor-pointer"
                >
                    {clubs && clubs.map(c => <option key={c.id} value={c.id}>{c.clubName}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: THE FORM ================= */}
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
                            onChange={e => handleInputChange('title', e.target.value)}
                            // ✅ ADDED: Conditional Error Styling
                            className={`w-full p-3 rounded-xl border transition-all font-semibold text-gray-900 ${
                                errors.title 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {/* ✅ ADDED: Error Message */}
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
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
                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold cursor-pointer"
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
                                onChange={e => handleInputChange('date', e.target.value)}
                                className={`w-full p-2.5 rounded-xl border cursor-pointer text-gray-700 ${
                                    errors.date ? 'border-red-500' : 'border-gray-200'
                                }`}
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input 
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={e => handleInputChange('startTime', e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 text-gray-700 cursor-pointer"
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
                                    className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">Set Duration</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="timeMode" 
                                    checked={formData.timeMode === 'endTime'}
                                    onChange={() => setFormData({...formData, timeMode: 'endTime'})}
                                    className="text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                                        onChange={e => {const val = e.target.value; setFormData({...formData, duration: val == "" ? 0 : parseFloat(e.target.value)})}}
                                        className="w-32 p-2.5 rounded-xl text-gray-700 border border-gray-200"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">
                                            Ends at <span className="font-bold text-gray-900">{formData.endTime}</span>
                                        </span>
                                        {/* Show end time error even in duration mode if calculated time is invalid */}
                                        {errors.endTime && <span className="text-red-500 text-xs font-bold">{errors.endTime}</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">End Time</label>
                                <input 
                                    type="time" 
                                    value={formData.endTime}
                                    onChange={e => handleInputChange('endTime', e.target.value)}
                                    className={`w-32 p-2.5 rounded-xl border cursor-pointer ${
                                        errors.endTime ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                />
                                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                            </div>
                        )}
                    </div>

                    {/* LOCATION */}
                    <div>
                        <div className="flex gap-4 mb-3">
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, locationType: 'on-campus'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
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
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
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
                            onChange={e => handleInputChange('location', e.target.value)}
                            placeholder={formData.locationType === 'on-campus' ? "e.g. Room 101, Tech Hall" : "e.g. 123 Main St, Downtown"}
                            className={`w-full p-3 rounded-xl border mb-2 text-gray-700 ${
                                errors.location 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                                : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                            }`}
                        />
                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}

                        {/* Quick Select Buttons */}
                        {formData.locationType === 'on-campus' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {CAMPUS_LOCATIONS.map(loc => (
                                    <button
                                        key={loc}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, location: loc});
                                            if(errors.location) setErrors({...errors, location: ''});
                                        }}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
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
                            onChange={e => handleInputChange('description', e.target.value)}
                            className={`w-full p-3 rounded-xl border min-h-[100px] text-gray-700 ${
                                errors.description 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                                : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
                            }`}
                            placeholder="Tell students what makes this event awesome..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
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
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
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
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer ${
                            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isSubmitting ? "Publishing Event..." : "Publish Event"}
                    </button>
                </div>

            </form>
        </div>

        {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-8 space-y-4">
            
            {/* 1. DEVICE TOGGLE BAR */}
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                </div>
        
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button 
                        type="button" 
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Mobile View"
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>
        
            {/* 2. THE PREVIEW CONTAINER */}
            <div className={`transition-all duration-300 ease-in-out origin-top ${
                previewMode === 'mobile' 
                ? 'w-[320px] mx-auto border-[12px] border-gray-900 rounded-[2.5rem] shadow-2xl bg-gray-900 overflow-hidden' 
                : 'w-full'
            }`}>
                
                {/* 3. INNER CARD */}
                <div className={`bg-white overflow-hidden border border-gray-200 pointer-events-none select-none ${
                    previewMode === 'mobile' ? 'rounded-[1.7rem] h-full' : 'rounded-2xl shadow-xl'
                }`}>
                    
                    {/* A. IMAGE AREA */}
                    <div className="h-48 bg-gray-200 relative group">
                        <img 
                            src={formData.coverImage || "/gsu_image.jpg"} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt="Event Preview" 
                            onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/800x400?text=No+Image";
                            }}
                        />
                    
                        {/* Club Badge Overlay */}
                        <div className="absolute top-4 left-4 z-10">
                            <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-800">
                                {clubs && clubs.find(c => c.id === formData.clubId)?.clubName || "Loading Club..."}
                            </span>
                        </div>
                    
                        {!formData.coverImage && (
                            <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-full">
                                Default Image
                            </div>
                        )}
                    </div>
        
                    {/* B. CONTENT AREA */}
                    <div className="p-5">
                        {/* Title + Date Row */}
                        <div className="flex justify-between items-start mb-4 gap-4">
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 break-words">
                                    {formData.title || "Your Event Title"}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 h-10 break-words">
                                    {formData.description || "Description will appear here..."}
                                </p>
                            </div>
        
                            <div className="flex flex-col items-center justify-center bg-blue-50 w-14 h-14 rounded-xl border border-blue-100 shrink-0">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">{previewMonth}</span>
                                <span className="text-lg font-extrabold text-gray-900">{previewDay}</span>
                            </div>
                        </div>
        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{formData.startTime} - {formData.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{formData.location || "Location TBD"}</span>
                            </div>
                        </div>
        
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
            </div>
        
            <p className="text-center text-xs text-gray-400 px-8 mt-4">
                {previewMode === 'mobile' 
                    ? "Previewing how students see it on their phones." 
                    : "Previewing how it looks on laptops and tablets."}
            </p>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    // This tells Next.js: "Don't try to pre-render the inside part on the server.
    // Wait until we hit the browser to load the search params."
    <Suspense fallback={<div className="p-10 text-center">Loading event form...</div>}>
      <CreateEventSuspended />
    </Suspense>
  );
}