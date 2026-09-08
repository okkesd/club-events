"use client";
import {useUI} from "@/i18n/useUI";


import React, { useState, useEffect } from 'react';
import {
    Shield, CheckCircle2, XCircle, Clock, Search,
    MoreHorizontal, ExternalLink, Loader2,
    AlertTriangle, X, Ban, Mail, Trash2, Instagram, Check
} from 'lucide-react';
import { getAdminClubs, setClubVerification, getContacts, getAdminSubscriptions, cleanupStorage, getScrapedEvents, updateClub } from '@/app/lib/api';
import { ClubData, ISubscription } from '@/app/lib/types';
import ScrapedEventsPanel from '@/app/components/ScrapedEventsPanel';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

// ✅ Define Contact Type
interface ContactMsg {
    id?: string; // Optional if backend doesn't send ID
    email: string;
    message: string;
    date: string;
}

/**
 * Instagram handle for a club — admin-only (PATCH /clubs/{id} 403s for a club editing itself).
 * Without it, scraped Instagram posts can't auto-match to this club.
 */
function IgHandleCell({ club }: { club: ClubData }) {
  const {t} = useUI();
    const [value, setValue] = useState(club.igUsername || "");
    const [saved, setSaved] = useState<string>(club.igUsername || "");
    const [isSaving, setIsSaving] = useState(false);
    const [failed, setFailed] = useState(false);

    const isDirty = value.trim() !== saved;

    const save = async () => {
        const next = value.trim();
        setIsSaving(true);
        setFailed(false);
        try {
            await updateClub(club.id, { igUsername: next || null });
            setSaved(next);
        } catch {
            setFailed(true);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-gray-500 text-sm">@</span>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isDirty) save(); }}
                placeholder={t("handle")}
                className={`w-32 px-2 py-1 text-sm rounded-lg border transition-colors outline-none
                            focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:text-gray-200
                            ${failed ? "border-red-400 dark:border-red-700" : "border-gray-200 dark:border-gray-700"}`}
            />
            {isDirty && (
                <button
                    onClick={save}
                    disabled={isSaving}
                    className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title={t("Save handle")}
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
            )}
            {failed && <span className="text-xs text-red-500">{t("failed")}</span>}
        </div>
    );
}

export default function AdminDashboard() {
  const {t, locale} = useUI();
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'blocked' | 'contacts' | 'subscribers' | 'scraped'>('pending');

  // Pending-count badge for the Scraped Events tab
  const [scrapedPending, setScrapedPending] = useState<number | null>(null);

  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [contacts, setContacts] = useState<ContactMsg[]>([]);
  const [subscribers, setSubscribers] = useState<ISubscription[]>([]);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup State
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{ total_in_storage: number; orphans_found: number; deleted: number } | null>(null);

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
    } else if (activeTab === 'subscribers') {
        fetchSubscribers();
    } else if (activeTab === 'scraped') {
        setIsLoadingPage(false); // the panel loads its own data
    } else {
        fetchClubs();
    }
  }, [activeTab, isAuthorized]);

  // Pending scraped-event count for the tab badge
  useEffect(() => {
    if (!isAuthorized) return;
    getScrapedEvents({ status: 'pending', pageSize: 1 })
      .then(res => setScrapedPending(res.pagination?.total ?? 0))
      .catch(() => setScrapedPending(null));
  }, [isAuthorized]);

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

  const fetchSubscribers = async () => {
    setIsLoadingPage(true);
    try {
      const data = await getAdminSubscriptions();
      console.log(data)
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
      setSubscribers([]);
    } finally {
      setIsLoadingPage(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoadingPage(true);
    try {
        const res = await getContacts();
        setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
        console.error("Failed to fetch contacts", err);
        setContacts([]);
    } finally {
        setIsLoadingPage(false);
    }
  };

  // --- ACTIONS ---
  const handleApprove = async (clubId: string) => {
    if (!confirm(t("Confirm approval for this club?"))) return;
    setClubs(prev => prev.filter(c => c.id !== clubId));
    try {
        await setClubVerification(clubId, true);
    } catch (err) {
        alert(t("Approval failed"));
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
        alert(t("Please provide a reason."));
        return;
    }
    setIsSubmitting(true);
    setClubs(prev => prev.filter(c => c.id !== selectedClubId));
    setIsRejectModalOpen(false); 
    try {
        await setClubVerification(selectedClubId, false, rejectionReason);
    } catch (err) {
        alert(t("Rejection failed"));
        window.location.reload();
    } finally {
        setIsSubmitting(false);
        setSelectedClubId(null);
    }
  };

  const handleCleanup = async () => {
    setShowCleanupConfirm(false);
    setIsCleaningUp(true);
    setCleanupResult(null);
    try {
      const result = await cleanupStorage();
      setCleanupResult(result);
    } catch {
      alert(t("Storage cleanup failed."));
    } finally {
      setIsCleaningUp(false);
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
                    {t("Admin Panel")}</h1>
                <p className="text-gray-500 dark:text-gray-400 transition-colors">{t("Manage club applications and platform safety.")}</p>
            </div>
            <button
                onClick={() => setShowCleanupConfirm(true)}
                disabled={isCleaningUp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors
                           bg-red-50 text-red-700 hover:bg-red-100 border border-red-200
                           dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:border-red-900/40
                           disabled:opacity-50"
            >
                {isCleaningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isCleaningUp ? t("Cleaning...") : t("Clean Storage")}
            </button>
        </header>

        {/* Cleanup Result Banner */}
        {cleanupResult && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t("Storage cleaned —")} <strong>{cleanupResult.orphans_found}</strong>  {t("orphan(s) found,")} <strong>{cleanupResult.deleted}</strong>  {t("deleted. Total files:")} {cleanupResult.total_in_storage}.
                    </p>
                </div>
                <button onClick={() => setCleanupResult(null)} className="text-green-500 hover:text-green-700 dark:hover:text-green-300">
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* --- TABS --- */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto transition-colors">
            {/* Club Tabs */}
            {[
                { id: 'pending', icon: Clock, label: t("Pending Review"), color: 'orange' },
                { id: 'verified', icon: CheckCircle2, label: t("Active Clubs"), color: 'green' },
                { id: 'blocked', icon: Ban, label: t("Blocked"), color: 'red' },
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

            {/* Messages Tab */}
            <button
                onClick={() => setActiveTab('contacts')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'contacts'
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <Mail className="w-4 h-4" />
                {t("Messages")}</button>

            {/* Subscribers Tab */}
            <button
                onClick={() => setActiveTab('subscribers')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'subscribers'
                    ? 'border-purple-600 text-purple-700 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <Mail className="w-4 h-4" />
                {t("Subscribers")}</button>

            {/* Scraped Events Tab */}
            <button
                onClick={() => setActiveTab('scraped')}
                className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === 'scraped'
                    ? 'border-pink-600 text-pink-700 dark:text-pink-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <Instagram className="w-4 h-4" />
                {t("Scraped Events")}{!!scrapedPending && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                        {scrapedPending}
                    </span>
                )}
            </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
            
            {activeTab === 'scraped' ? (
                <ScrapedEventsPanel onPendingCountChange={setScrapedPending} />
            ) : isLoadingPage ? (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t("Loading...")}</span>
                </div>
            ) : (
                <>
                {/* --- 0. SUBSCRIBERS TABLE --- */}
                {activeTab === 'subscribers' ? (
                    subscribers.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t("No subscribers yet.")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Email")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Club")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Category")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Status")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Subscribed")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {subscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-5 text-sm font-semibold text-gray-900 dark:text-gray-200">{sub.email}</td>
                                            <td className="p-5 text-sm text-gray-500 dark:text-gray-400">
                                                {sub.clubs.length > 0
                                                    ? sub.clubs.map(c => c.clubName).join(", ")
                                                    : "—"}
                                            </td>
                                            <td className="p-5 text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {sub.categories.length > 0
                                                    ? sub.categories.map(c => t(c.category)).join(", ")
                                                    : "—"}
                                            </td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    sub.isActive
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                                }`}>
                                                    {sub.isActive ? t("Active") : t("Inactive")}
                                                </span>
                                            </td>
                                            <td className="p-5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(sub.createdAt).toLocaleDateString(locale)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) :

                /* --- 1. MESSAGES TABLE --- */
                activeTab === 'contacts' ? (
                    contacts.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t("No messages found.")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                                    <tr>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-40">{t("Date")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-64">{t("Email")}</th>
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Message")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {contacts.map((msg, idx) => (
                                        <tr key={msg.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {new Date(msg.date).toLocaleDateString(locale)} <span className="text-xs opacity-50">{new Date(msg.date).toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})}</span>
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
                            <p>{t("No clubs found in this tab.")}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                                <tr>
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Club Name")}</th>
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Status")}</th>
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Instagram</th>
                                    {activeTab === 'blocked' && (
                                        <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t("Reason")}</th>
                                    )}
                                    <th className="p-5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t("Actions")}</th>
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
                                                    <CheckCircle2 className="w-3 h-3" />  {t("Active")}</span>
                                            ) : (club.rejectionReason && club.rejectionReason !== "None") ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 transition-colors">
                                                    <Ban className="w-3 h-3" />  {t("Blocked")}</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 transition-colors">
                                                    <Clock className="w-3 h-3" />  {t("Pending")}</span>
                                            )}
                                        </td>

                                        {/* IG handle — enables scraped-event auto-matching */}
                                        <td className="p-5">
                                            <IgHandleCell key={club.id} club={club} />
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
                                                    title={t("View Profile")}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>

                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApprove(club.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-900/30 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                                                            title={t("Approve")}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectClick(club.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/30 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors"
                                                            title={t("Reject")}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {activeTab === 'verified' && (
                                                     <button 
                                                        onClick={() => handleRejectClick(club.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title={t("Revoke Verification")}
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
                                                        {t("Re-Activate")}</button>
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-red-100 transition-colors">{t("Block Club")}</h3>
                            <p className="text-sm text-gray-500 dark:text-red-200/70 transition-colors">{t("Provide a reason for the block.")}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsRejectModalOpen(false)}>
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                </div>
                
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                        {t("Reason")} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full h-32 p-3 border rounded-xl resize-none transition-colors
                                   border-gray-200 text-gray-700 focus:ring-2 focus:ring-red-500
                                   dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-red-500/50"
                        placeholder={t("Violation of university guidelines...")}
                    />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 transition-colors">
                    <button 
                        onClick={() => setIsRejectModalOpen(false)} 
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {t("Cancel")}</button>
                    <button 
                        onClick={submitRejection}
                        disabled={isSubmitting || !rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 dark:hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? t("Processing...") : t("Block Club")}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- CLEANUP CONFIRMATION MODAL --- */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 transition-colors border border-transparent dark:border-gray-700">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("Clean Up Storage")}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t("This will delete unused images from storage. Orphaned files that are no longer referenced by any club, event, or announcement will be removed.")}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={() => setShowCleanupConfirm(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                        {t("Cancel")}</button>
                    <button
                        onClick={handleCleanup}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
                    >
                        {t("Continue")}</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
