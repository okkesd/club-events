"use client";

import React, { useState, useEffect } from 'react';
import { 
    Shield, CheckCircle2, XCircle, Clock, Search, 
    MoreHorizontal, ExternalLink, Loader2,
    AlertTriangle, X, Ban, Mail // ✅ Added Mail Icon
} from 'lucide-react';
// ✅ Import getContacts
import { getAdminClubs, setClubVerification, getContacts } from '@/app/lib/api';
import { ClubData } from '@/app/lib/types';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

// ✅ Define Contact Type
interface ContactMsg {
    id?: string; // Optional if backend doesn't send ID
    email: string;
    message: string;
    date: string;
}

export default function AdminDashboard() {
  // ✅ Added 'contacts' to tab type
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'blocked' | 'contacts'>('pending');
  
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [contacts, setContacts] = useState<ContactMsg[]>([]); // ✅ State for messages
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 1. AUTH CHECK
  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
        router.replace("/main");
    } else {
        setIsAuthorized(true);
    }
  }, [user, isLoading]);

  // 2. DATA FETCHING ROUTER
  useEffect(() => {
    if (!isAuthorized) return;

    if (activeTab === 'contacts') {
        fetchMessages();
    } else {
        fetchClubs();
    }
  }, [activeTab, isAuthorized]);

  // --- FETCHERS ---
  const fetchClubs = async () => {
    setIsLoadingPage(true);
    try {
        const apiStatus = activeTab === 'verified' ? 'verified' : 'pending';
        // Note: 'blocked' is filtered from 'pending'/all results usually, 
        // ensuring your API logic matches this is key.
        const rawData = await getAdminClubs(apiStatus);
        
        const data = Array.isArray(rawData) ? rawData : [];
        let filteredData = data;
        
        if (activeTab === 'pending') {
            filteredData = data.filter(c => (c.rejectionReason || "None") === "None" && !c.isVerified);
        } else if (activeTab === 'blocked') {
            filteredData = data.filter(c => (c.rejectionReason || "None") !== "None" && !c.isVerified);
        }
            
        setClubs(filteredData);
    } catch (err) {
        console.error("Failed to fetch clubs:", err);
        setClubs([]); 
    } finally {
        setIsLoadingPage(false);
    }
  };

  // ✅ NEW: Fetch Contacts
  const fetchMessages = async () => {
    setIsLoadingPage(true);
    try {
        const res = await getContacts();
        // Assuming API returns { success: true, contacts: [...] } OR just [...]
        // Adjust based on your actual API response structure
        const msgs = res.data; 
        setContacts(msgs);
    } catch (err) {
        console.error("Failed to fetch contacts", err);
    } finally {
        setIsLoadingPage(false);
    }
  };

  // --- ACTIONS ---
  const handleApprove = async (clubId: string) => {
    if (!confirm("Confirm approval for this club?")) return;
    setClubs(prev => prev.filter(c => c.id !== clubId));
    try {
        await setClubVerification(clubId, true);
    } catch (err) {
        alert("Approval failed");
        window.location.reload(); 
    }
  };

  const handleRejectClick = (clubId: string) => {
    setSelectedClubId(clubId);
    setRejectionReason(""); 
    setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!selectedClubId) return;
    if (!rejectionReason.trim()) {
        alert("Please provide a reason.");
        return;
    }
    setIsSubmitting(true);
    setClubs(prev => prev.filter(c => c.id !== selectedClubId));
    setIsRejectModalOpen(false); 
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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                    <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    Admin Panel
                </h1>
                <p className="text-gray-500 dark:text-gray-400 transition-colors">Manage club applications and platform safety.</p>
            </div>
        </header>

        {/* --- TABS --- */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto transition-colors">
            {/* Club Tabs */}
            {[
                { id: 'pending', icon: Clock, label: 'Pending Review', color: 'orange' },
                { id: 'verified', icon: CheckCircle2, label: 'Active Clubs', color: 'green' },
                { id: 'blocked', icon: Ban, label: 'Blocked', color: 'red' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === tab.id
                        ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400` 
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}

            {/* ✅ Messages Tab */}
            <button
                onClick={() => setActiveTab('contacts')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'contacts' 
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <Mail className="w-4 h-4" />
                Messages
            </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
            
            {isLoadingPage ? (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                {/* --- 1. MESSAGES TABLE --- */}
                {activeTab === 'contacts' ? (
                    contacts.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No messages found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-40">Date</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-64">Email</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {contacts.map((msg, idx) => (
                                        <tr key={msg.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(msg.date).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(msg.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </td>
                                            <td className="p-5 text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                <a href={`mailto:${msg.email}`} className="hover:text-blue-500 transition-colors">
                                                    {msg.email}
                                                </a>
                                            </td>
                                            <td className="p-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-w-[300px]">
                                                {msg.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                
                /* --- 2. CLUBS TABLE (Existing Logic) --- */
                    (!Array.isArray(clubs) || clubs.length === 0) ? (
                        <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No clubs found in this tab.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                                <tr>
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Club Name</th>
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</th>
                                    {activeTab === 'blocked' && (
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reason</th>
                                    )}
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {clubs.map((club) => (
                                    <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="p-5">
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{club.clubName}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{club.email}</p>
                                        </td>
                                        
                                        {/* Status Badge */}
                                        <td className="p-5">
                                            {club.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 transition-colors">
                                                    <CheckCircle2 className="w-3 h-3" /> Active
                                                </span>
                                            ) : (club.rejectionReason && club.rejectionReason !== "None") ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 transition-colors">
                                                    <Ban className="w-3 h-3" /> Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 transition-colors">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </td>

                                        {activeTab === 'blocked' && (
                                            <td className="p-5 text-sm text-red-600 dark:text-red-400 italic max-w-xs truncate">
                                                "{club.rejectionReason}"
                                            </td>
                                        )}

                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a 
                                                    href={`/club/${club.id}`} 
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>

                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApprove(club.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-900/30 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectClick(club.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/30 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {activeTab === 'verified' && (
                                                     <button 
                                                        onClick={() => handleRejectClick(club.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Revoke Verification"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {activeTab === 'blocked' && (
                                                    <button 
                                                        onClick={() => handleApprove(club.id)}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
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
                </>
            )}
        </div>
      </div>

      {/* --- REJECTION MODAL (Same as before) --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors border border-transparent dark:border-gray-700">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900/30 flex justify-between items-start transition-colors">
                    <div className="flex gap-3">
                        <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full transition-colors">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-red-100 transition-colors">Block Club</h3>
                            <p className="text-sm text-gray-500 dark:text-red-200/70 transition-colors">Provide a reason for the block.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsRejectModalOpen(false)}>
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                </div>
                
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full h-32 p-3 border rounded-xl resize-none transition-colors
                                   border-gray-200 text-gray-700 focus:ring-2 focus:ring-red-500
                                   dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-red-500/50"
                        placeholder="Violation of university guidelines..."
                    />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 transition-colors">
                    <button 
                        onClick={() => setIsRejectModalOpen(false)} 
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={submitRejection}
                        disabled={isSubmitting || !rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 dark:hover:bg-red-500 disabled:opacity-50 transition-colors"
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