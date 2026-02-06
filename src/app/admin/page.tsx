"use client";

import React, { useState, useEffect } from 'react';
import { 
    Shield, CheckCircle2, XCircle, Clock, Search, 
    MoreHorizontal, ExternalLink, Loader2,
    AlertTriangle,
    X,
    Ban
} from 'lucide-react';
import { getAdminClubs, setClubVerification } from '@/app/lib/api';
import { ClubData } from '@/app/lib/types';
import { useAuth } from '../context/AuthContext';
import { useRouter, notFound } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'blocked'>('pending');
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    
    if (isLoading) return;

    if (!user || user.role !== 'admin') {
        
      notFound()
      //router.replace('/404'); // Or just kick them to main
      //router.replace('/main');
    } else {
        
      setIsAuthorized(true);
    }
  }, [user, isLoading, router]);

  // FETCH DATA
  const fetchClubs = async () => {
    setIsLoadingPage(true);
    try {
        const apiStatus = activeTab === 'verified' ? 'verified' : 'pending';
        const rawData = await getAdminClubs(apiStatus);

        // 🛡️ SECURITY FIX: Ensure 'data' is always an array before touching it.
        // If API returns null/undefined, we default to empty array []
        const data = Array.isArray(rawData) ? rawData : [];
        
        // ✅ FILTERING LOGIC (Now safe because data is guaranteed to be an array)
        let filteredData = data;
        
        if (activeTab === 'pending') {
            // Pending = Unverified AND No Rejection Reason
            // Safety check: ensure rejectionReason exists or default to ""
            filteredData = data.filter(c => (c.rejectionReason || "") === "");
        } else if (activeTab === 'blocked') {
            // Blocked = Unverified AND Has Rejection Reason
            filteredData = data.filter(c => (c.rejectionReason || "") !== "");
        }
            
        setClubs(filteredData);
    } catch (err) {
        console.error("Failed to fetch clubs:", err);
        setClubs([]); // Fallback to empty list on error
    } finally {
        setIsLoadingPage(false);
    }
};

  // Re-fetch when tab changes
  useEffect(() => {
    fetchClubs();
  }, [activeTab, user]);

  // --- HANDLERS ---

  // A. APPROVE (Immediate Action)
  const handleApprove = async (clubId: string) => {
    if (!confirm("Confirm approval for this club?")) return;
    
    // Optimistic Update
    setClubs(prev => prev.filter(c => c.id !== clubId));

    try {
        await setClubVerification(clubId, true);
    } catch (err) {
        alert("Approval failed");
        // Revert optimistic update (simplified for brevity, usually re-fetch)
        window.location.reload(); 
    }
  };

  // B. REJECT CLICK (Opens Modal)
  const handleRejectClick = (clubId: string) => {
    setSelectedClubId(clubId);
    setRejectionReason(""); // Reset input
    setIsRejectModalOpen(true);
  };

  // C. SUBMIT REJECTION (API Call)
  const submitRejection = async () => {
    if (!selectedClubId) return;
    if (!rejectionReason.trim()) {
        alert("Please provide a reason.");
        return;
    }

    setIsSubmitting(true);
    
    // Optimistic Update: Remove from list immediately
    setClubs(prev => prev.filter(c => c.id !== selectedClubId));
    setIsRejectModalOpen(false); // Close modal

    try {
        await setClubVerification(selectedClubId, false, rejectionReason);
    } catch (err) {
        alert("Rejection failed");
        window.location.reload();
    } finally {
        setIsSubmitting(false);
        setSelectedClubId(null);
    }
  };

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-400 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-blue-600" />
                    Admin Panel
                </h1>
                <p className="text-gray-500">Manage club applications and platform safety.</p>
            </div>
        </header>

        {/* --- TABS --- */}
        <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
            <button
                onClick={() => setActiveTab('pending')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'pending' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                <Clock className="w-4 h-4" />
                Pending Review
            </button>
            <button
                onClick={() => setActiveTab('verified')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'verified' 
                    ? 'border-green-600 text-green-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                <CheckCircle2 className="w-4 h-4" />
                Active Clubs
            </button>
            <button
                onClick={() => setActiveTab('blocked')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'blocked' 
                    ? 'border-red-600 text-red-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
                <Ban className="w-4 h-4" />
                Blocked / Rejected
            </button>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoadingPage ? (
                <div className="p-12 text-center text-gray-400">Loading clubs...</div>
            ) : (
        // ✅ DEFENSIVE CHECK: Ensure clubs is an array AND has length
        !Array.isArray(clubs) || clubs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No clubs found in this tab.</p>
            </div>
        ) : (
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Club Name</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            {activeTab === 'blocked' && (
                                <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                            )}
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clubs.map((club) => (
                            <tr key={club.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-5">
                                    <p className="font-bold text-gray-900">{club.clubName}</p>
                                    <p className="text-xs text-gray-400">{club.email}</p>
                                </td>
                                
                                {/* Status Badge */}
                                <td className="p-5">
                                    {club.isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                            <CheckCircle2 className="w-3 h-3" /> Active
                                        </span>
                                    ) : club.rejectionReason ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                            <Ban className="w-3 h-3" /> Blocked
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </td>

                                {/* Rejection Reason Column (Only for Blocked Tab) */}
                                {activeTab === 'blocked' && (
                                    <td className="p-5 text-sm text-red-600 italic max-w-xs truncate">
                                        "{club.rejectionReason}"
                                    </td>
                                )}

                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={`/club/${club.id}`} 
                                            target="_blank"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="View Profile"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>

                                        {/* 1. PENDING: Approve OR Reject */}
                                        {activeTab === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(club.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg font-bold text-sm flex items-center gap-1"
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleRejectClick(club.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg font-bold text-sm flex items-center gap-1"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* 2. VERIFIED: Ban (Reject) */}
                                        {activeTab === 'verified' && (
                                             <button 
                                                onClick={() => handleRejectClick(club.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Revoke Verification"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* 3. BLOCKED: Re-confirm (Approve) */}
                                        {activeTab === 'blocked' && (
                                            <button 
                                                onClick={() => handleApprove(club.id)}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                Re-Activate
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )
            )}
        </div>
      </div>

      {/* --- REJECTION MODAL (Same as before) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Block Club</h3>
                            <p className="text-sm text-gray-500">Provide a reason for the block.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsRejectModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label>
                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 resize-none text-gray-700"
                    />
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-gray-700 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button 
                        onClick={submitRejection}
                        disabled={isSubmitting || !rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : "Block Club"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}