"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, Upload, Image as ImageIcon, 
  Type, Map, Eye, Smartphone, Monitor 
} from 'lucide-react';
import { createEvent, uploadImage, getAllClubs, resolveImageUrl } from '@/app/lib/api';
import { ClubData } from '@/app/lib/types';
import { useAuth } from '@/app/context/AuthContext';

type clubs_type = {
  id: string
  clubName: string
}

const CAMPUS_LOCATIONS = ["Tech Hall", "Student Center", "Library 304", "Engineering Lab"];
const PREDEFINED_TAGS = ["Workshop", "Social", "Free Food", "Career", "Competition", "Lecture"];

// action trigger
function CreateEventSuspended() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const preselectedClubId = searchParams.get('preselect');
  
  const [isUploading, setIsUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [clubs, setClubs] = useState<clubs_type[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // errors for the form
  const [genericError, setGenericError] = useState<string | null>(null); // errors for generic case
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user , isLoading } = useAuth()
 
  
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
    isRegistrationOpen: false,
    capacity: 0,
    registrationLink: "",
    likes: 0
  });

  // Fetch clubs
  useEffect(() => {

    if (isLoading) return

    if (!user) {
        router.push("/login")
    }

    if (user && user.role === 'club') {
        setFormData(prev => ({ ...prev, clubId: user.id }));
        
        // OPTIMIZATION: Don't fetch API. Just use the logged-in user's data.
        setClubs([{ id: user.id, clubName: user.club_name }]);
        setPageLoading(false);
    } 
    else if (user && user.role === 'admin') {
        // Only Admins need to fetch the list
        fetchClubsForAdmin();
    }

  }, [user, isLoading, router]);

  const fetchClubsForAdmin = async () => {
    try {
        const data = await getAllClubs();
        if (!data) {
            throw new Error("Failed to fetch all clubs")
        }
        setClubs(
            data.map((item) => 
                ({
                    id: item.id, 
                    clubName: item.clubName
                })
            )
        );
        
        // Default to the first club in the list (or the admin's own ID if applicable)
        if (data && data.length > 0) {
             setFormData(prev => ({ ...prev, clubId: data[0].id }));
        }
    } catch (err) {
        console.error(err);
        setGenericError("Failed to load club list. Please refresh.");
    } finally {
        setPageLoading(false);
    }
  };

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

    // Check if end time is effectively before start time
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
    
    if (!validateForm()) {
        alert("Please fix the highlighted errors.");
        return; 
    }

    setIsSubmitting(true);
    
    try {
        const {timeMode, ...pureData} = (formData)
        console.log("data to send: ", pureData)
        const response = await createEvent(pureData);

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-8 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Create Event</h1>
            
            <div className={`flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors ${user?.role !== "admin" ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <span className={`text-sm text-gray-500 dark:text-gray-400 font-medium ${user?.role !== "admin" ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Posting as:</span>
                <select 
                    value={user?.id}
                    onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                    className={`bg-transparent font-bold text-gray-900 dark:text-white border-none focus:ring-0 p-0 ${user?.role !== "admin" ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={user?.role !== "admin"}
                >
                    {clubs && clubs.map(c => <option key={c.id} value={c.id} className="dark:bg-gray-900">{c.clubName}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: THE FORM ================= */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* SECTION 1: BASICS */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
                    <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Type className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        Basic Info
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Event Title</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Intro to React Workshop"
                            value={formData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            className={`w-full p-3 rounded-xl border transition-all font-semibold 
                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:placeholder-gray-500
                                ${errors.title 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:border-red-500/50' 
                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Cover Image</label>
                        <div className="flex items-center gap-4">
                            {formData.coverImage ? (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group transition-colors">
                                    <img src={resolveImageUrl(formData.coverImage)} alt="Cover" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, coverImage: ""})}
                                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 transition-colors">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                            
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors shadow-sm
                                                bg-white text-gray-700 border-gray-300 hover:bg-gray-50
                                                dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                                    <Upload className="w-4 h-4" />
                                    {isUploading ? "Uploading..." : "Upload Image"}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                                    Recommended: 1200x600px. Max 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: TIME & PLACE */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
                    <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                        Time & Place
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => handleInputChange('date', e.target.value)}
                                className={`w-full p-2.5 rounded-xl border cursor-pointer 
                                           bg-white dark:bg-gray-800 text-gray-700 dark:text-white dark:border-gray-700 
                                           ${errors.date ? 'border-red-500 dark:border-red-500/50' : 'border-gray-200'}`}
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Start Time</label>
                            <input 
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={e => handleInputChange('startTime', e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-white cursor-pointer transition-colors"
                            />
                        </div>
                    </div>

                    {/* DURATION vs END TIME TOGGLE */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="timeMode" 
                                    checked={formData.timeMode === 'duration'}
                                    onChange={() => setFormData({...formData, timeMode: 'duration'})}
                                    className="text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Duration</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="timeMode" 
                                    checked={formData.timeMode === 'endTime'}
                                    onChange={() => setFormData({...formData, timeMode: 'endTime'})}
                                    className="text-blue-600 focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Set End Time</span>
                            </label>
                        </div>

                        {formData.timeMode === 'duration' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Duration (Hours)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        min="0.5"
                                        max="12"
                                        value={formData.duration}
                                        onChange={e => {const val = e.target.value; setFormData({...formData, duration: val == "" ? 0 : parseFloat(e.target.value)})}}
                                        className="w-32 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-white transition-colors"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Ends at <span className="font-bold text-gray-900 dark:text-white">{formData.endTime}</span>
                                        </span>
                                        {errors.endTime && <span className="text-red-500 text-xs font-bold">{errors.endTime}</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">End Time</label>
                                <input 
                                    type="time" 
                                    value={formData.endTime}
                                    onChange={e => handleInputChange('endTime', e.target.value)}
                                    className={`w-32 p-2.5 rounded-xl border cursor-pointer 
                                        bg-white dark:bg-gray-800 text-gray-700 dark:text-white dark:border-gray-700
                                        ${errors.endTime ? 'border-red-500' : 'border-gray-200'}`}
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
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer border ${
                                    formData.locationType === 'on-campus' 
                                    ? 'bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                             >
                                On Campus
                             </button>
                             <button
                                type="button"
                                onClick={() => setFormData({...formData, locationType: 'off-campus'})}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer border ${
                                    formData.locationType === 'off-campus' 
                                    ? 'bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                             >
                                Off Campus
                             </button>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                            {formData.locationType === 'on-campus' ? "Room / Building" : "Address / Venue"}
                        </label>
                        <input 
                            type="text"
                            required
                            value={formData.location}
                            onChange={e => handleInputChange('location', e.target.value)}
                            placeholder={formData.locationType === 'on-campus' ? "e.g. Room 101, Tech Hall" : "e.g. 123 Main St, Downtown"}
                            className={`w-full p-3 rounded-xl border mb-2 
                                bg-white dark:bg-gray-800 text-gray-700 dark:text-white dark:placeholder-gray-500
                                ${errors.location 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:border-red-500/50' 
                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
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
                                        className="text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer
                                                   bg-gray-100 hover:bg-gray-200 text-gray-600
                                                   dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 3: DETAILS */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
                    <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                        <Map className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                        Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Description</label>
                        <textarea 
                            rows={4}
                            required
                            value={formData.description}
                            onChange={e => handleInputChange('description', e.target.value)}
                            className={`w-full p-3 rounded-xl border min-h-[100px] 
                                bg-white dark:bg-gray-800 text-gray-700 dark:text-white dark:placeholder-gray-500
                                ${errors.description 
                                ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:border-red-500/50' 
                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                            }`}
                            placeholder="Tell students what makes this event awesome..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">Tags (Max 3)</label>
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
                                            ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
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
                            isSubmitting 
                            ? "bg-gray-400 cursor-not-allowed dark:bg-gray-700" 
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
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
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                </div>
        
                <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-lg transition-colors">
                    <button 
                        type="button" 
                        onClick={() => setPreviewMode('desktop')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            previewMode === 'desktop' 
                            ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                        title="Desktop View"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPreviewMode('mobile')}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            previewMode === 'mobile' 
                            ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-700 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                {/* This card replicates the Event Card style. In dark mode, it should be dark. */}
                <div className={`overflow-hidden pointer-events-none select-none transition-colors
                                bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                                ${previewMode === 'mobile' ? 'rounded-[1.7rem] h-full' : 'rounded-2xl shadow-xl'}`}>
                    
                    {/* A. IMAGE AREA */}
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 relative group transition-colors">
                        <img 
                            src={resolveImageUrl(formData.coverImage) || "/gsu_image.jpg"}
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
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1 break-words transition-colors">
                                    {formData.title || "Your Event Title"}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 break-words transition-colors">
                                    {formData.description || "Description will appear here..."}
                                </p>
                            </div>
        
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 transition-colors
                                            bg-blue-50 border border-blue-100
                                            dark:bg-blue-900/20 dark:border-blue-900/40">
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{previewMonth}</span>
                                <span className="text-lg font-extrabold text-gray-900 dark:text-white">{previewDay}</span>
                            </div>
                        </div>
        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="truncate">{formData.startTime} - {formData.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                                <span className="truncate">{formData.location || "Location TBD"}</span>
                            </div>
                        </div>
        
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors">
                            {formData.tags.length > 0 ? (
                                formData.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide transition-colors
                                                               bg-gray-100 text-gray-600
                                                               dark:bg-gray-800 dark:text-gray-400">
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide transition-colors
                                                 bg-gray-50 text-gray-400
                                                 dark:bg-gray-800/50 dark:text-gray-600">
                                    No Tags
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-8 mt-4 transition-colors">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950">Loading event form...</div>}>
      <CreateEventSuspended />
    </Suspense>
  );
}