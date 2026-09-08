"use client";
import {useUI} from "@/i18n/useUI";


import React, { useState, useEffect, useCallback } from "react";
import {
    Loader2, RefreshCw, CheckCircle2, XCircle, Trash2, X,
    AlertTriangle, ExternalLink, Instagram, Calendar, MapPin,
    Building2, Save, Shield, Link2, Sparkles, FileText,
    Megaphone, CalendarDays, Pin, Hourglass,
} from "lucide-react";
import {
    getScrapedEvents, approveScrapedEvent, approveScrapedAnnouncement,
    rejectScrapedEvent, deleteScrapedEvent, updateScrapedEvent, importScrapedEvents,
    getAdminClubs, resolveImageUrl, getIgClubMappings, deleteIgClubMapping,
} from "@/app/lib/api";
import {
    IScrapedEvent, IScrapedEventApprove, ScrapedEventStatus, ScrapedEventKind,
    AnnouncementCategory, ClubData, Pagination, IIgClubMapping,
} from "@/app/lib/types";
import PaginationBar from "@/app/components/PaginationBar";

// Rows below this are flagged — the extractor wasn't confident about them.
const LOW_CONFIDENCE = 0.6;

type StatusFilter = ScrapedEventStatus | "all";
type KindFilter = ScrapedEventKind | "all";

const ANNOUNCEMENT_CATEGORIES: AnnouncementCategory[] = [
    "internship", "job", "scholarship", "competition",
    "recruitment", "academic", "workshop", "general",
];

// A candidate publishes as an Event or an Announcement; the two take different
// forms and different approve endpoints, so the kind is on every row.
function KindBadge({ kind }: { kind: ScrapedEventKind }) {
  const {t} = useUI();
    const isAnnouncement = kind === "announcement";
    return (
        <span
            title={isAnnouncement ? t("Publishes as an announcement") : t("Publishes as an event")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                isAnnouncement
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
        >
            {isAnnouncement ? <Megaphone className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
            {t(kind)}
        </span>
    );
}

// The extractor gives a single datetime; the approve form needs date + time apart.
function splitDateTime(iso?: string | null): { date: string; time: string } {
    if (!iso) return { date: "", time: "" };
    const [datePart, timePart] = iso.split("T");
    return { date: datePart || "", time: (timePart || "").slice(0, 5) };
}

function addHours(time: string, hours: number): string {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const total = (h * 60 + m + Math.round(hours * 60)) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function ConfidenceBadge({ value }: { value: number }) {
  const {t} = useUI();
    const pct = Math.round(value * 100);
    const low = value < LOW_CONFIDENCE;
    return (
        <span
            title={low ? t("Low confidence — review carefully") : t("Extractor confidence")}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                low
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
            {low && <AlertTriangle className="w-3 h-3" />}
            {pct}%
        </span>
    );
}

function MissingPill({ label }: { label: string }) {
  const {t} = useUI();
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {t("Missing field: {field}", {field: t(label)})}
        </span>
    );
}

const inputClass =
    "w-full p-2.5 rounded-xl border text-sm transition-colors border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none " +
    "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500/50";
const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

export default function ScrapedEventsPanel({ onPendingCountChange }: { onPendingCountChange?: (n: number) => void }) {
  const {t, locale} = useUI();
    const [rows, setRows] = useState<IScrapedEvent[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [banner, setBanner] = useState<{ text: string; href?: string; linkLabel?: string } | null>(null);

    const [status, setStatus] = useState<StatusFilter>("pending");
    const [kindFilter, setKindFilter] = useState<KindFilter>("all");
    const [clubFilter, setClubFilter] = useState("");
    const [page, setPage] = useState(1);

    const [clubs, setClubs] = useState<ClubData[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Review drawer
    const [selected, setSelected] = useState<IScrapedEvent | null>(null);

    // Handle -> publisher mappings (the admin's routing decisions)
    const [showMappings, setShowMappings] = useState(false);

    const fetchRows = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getScrapedEvents({
                status,
                kind: kindFilter,
                clubId: clubFilter || undefined,
                page,
                pageSize: 20,
            });
            setRows(Array.isArray(res.data) ? res.data : []);
            setPagination(res.pagination ?? null);
            // The tab badge counts the whole pending queue — only an unfiltered
            // fetch can stand in for it.
            if (status === "pending" && kindFilter === "all" && !clubFilter) {
                onPendingCountChange?.(res.pagination?.total ?? 0);
            }
        } catch (err: any) {
            setError(err?.message || "Failed to load scraped events.");
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, [status, kindFilter, clubFilter, page, onPendingCountChange]);

    useEffect(() => { fetchRows(); }, [fetchRows]);

    useEffect(() => {
        getAdminClubs("verified")
            .then((data) => setClubs(Array.isArray(data) ? data : []))
            .catch(() => setClubs([]));
    }, []);

    // Reset to page 1 whenever the filters change.
    useEffect(() => { setPage(1); }, [status, kindFilter, clubFilter]);

    const handleImport = async () => {
        setIsImporting(true);
        setError(null);
        try {
            const res = await importScrapedEvents();
            const d = res.data;
            setBanner({
                text: d
                    ? t("Imported {imported} candidates, skipped {skipped}, matched {clubs} clubs.", {imported: d.imported, skipped: d.skipped, clubs: d.matchedClubs})
                    : "Inbox refreshed.",
            });
            await fetchRows();
        } catch (err: any) {
            setError(err?.message || "Import failed.");
        } finally {
            setIsImporting(false);
        }
    };

    // Optimistically drop the row from the queue, restore it if the call fails.
    const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

    const handleApproved = (row: IScrapedEvent, kind: ScrapedEventKind, publishedId?: string) => {
        removeRow(row.id);
        setSelected(null);
        setBanner({
            text: t("“{title}” published as {kind}.", {title: row.title || t("Candidate"), kind: t(kind === "announcement" ? "an announcement" : "an event")}),
            href: publishedId
                ? kind === "announcement" ? `/announcements/${publishedId}` : `/event/${publishedId}`
                : undefined,
            linkLabel: kind === "announcement" ? "View announcement" : "View event",
        });
        fetchRows();
    };

    const handleReject = async (row: IScrapedEvent, reason: string) => {
        removeRow(row.id);
        setSelected(null);
        try {
            await rejectScrapedEvent(row.id, reason || undefined);
            setBanner({ text: t("“{title}” rejected.", {title: row.title || t("Candidate")}) });
        } catch (err: any) {
            setError(err?.message || "Reject failed.");
            fetchRows();
        }
    };

    const handleDelete = async (row: IScrapedEvent) => {
        if (!confirm(t("Delete this candidate permanently? A published event, if any, is kept."))) return;
        removeRow(row.id);
        setSelected(null);
        try {
            await deleteScrapedEvent(row.id);
        } catch (err: any) {
            setError(err?.message || "Delete failed.");
            fetchRows();
        }
    };

    return (
        <div>
            {/* --- TOOLBAR --- */}
            <div className="p-5 flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                                status === s
                                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            }`}
                        >
                            {t(s)}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    {(["all", "event", "announcement"] as KindFilter[]).map((k) => (
                        <button
                            key={k}
                            onClick={() => setKindFilter(k)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors inline-flex items-center gap-1 ${
                                kindFilter === k
                                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            }`}
                        >
                            {k === "event" && <CalendarDays className="w-3 h-3" />}
                            {k === "announcement" && <Megaphone className="w-3 h-3" />}
                            {k === "all" ? t("All kinds") : t(k === "event" ? "Events" : "Announcements")}
                        </button>
                    ))}
                </div>

                <select
                    value={clubFilter}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className="p-2 rounded-xl border text-sm border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
                >
                    <option value="">{t("All clubs")}</option>
                    {clubs.map((c) => (
                        <option key={c.id} value={c.id}>{c.clubName}</option>
                    ))}
                </select>

                <button
                    onClick={() => setShowMappings((v) => !v)}
                    className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors
                               text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <Link2 className="w-4 h-4" />
                    {t("Instagram handles")}</button>

                <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors
                               bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200
                               dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:border-blue-900/40 disabled:opacity-50"
                >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isImporting ? t("Refreshing...") : t("Refresh inbox")}
                </button>
            </div>

            {showMappings && <IgMappingsSection />}

            {/* --- BANNERS --- */}
            {banner && (
                <div className="m-5 mb-0 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t(banner.text)}{" "}
                        {banner.href && (
                            <a href={banner.href} target="_blank" className="underline font-bold">
                                {banner.linkLabel ? t(banner.linkLabel) : t("View")}
                            </a>
                        )}
                    </p>
                    <button onClick={() => setBanner(null)}><X className="w-4 h-4 text-green-500" /></button>
                </div>
            )}
            {error && (
                <div className="m-5 mb-0 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{t(error)}</p>
                    <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
                </div>
            )}

            {/* --- QUEUE --- */}
            {isLoading ? (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{t("Loading...")}</span>
                </div>
            ) : rows.length === 0 ? (
                <div className="p-12 text-center text-gray-400 dark:text-gray-600">
                    <Instagram className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>
                        {t("No candidates match these filters.")}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className="p-5 flex gap-4 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            {/* Poster thumbnail */}
                            <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {row.postImageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={resolveImageUrl(row.postImageUrl)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Instagram className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {row.title || <span className="text-red-500 italic">{t("Untitled")}</span>}
                                    </p>
                                    <KindBadge kind={row.kind} />
                                    <ConfidenceBadge value={row.confidence} />
                                    {!row.title && <MissingPill label="title" />}
                                    {row.kind === "announcement" ? (
                                        !row.description && <MissingPill label="body" />
                                    ) : (
                                        <>
                                            {!row.date && <MissingPill label="date" />}
                                            {!row.location && <MissingPill label="location" />}
                                        </>
                                    )}
                                    {!row.clubId && <MissingPill label="club" />}
                                </div>

                                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                                    {row.kind === "announcement" ? (
                                        <>
                                            <span className="inline-flex items-center gap-1 capitalize">
                                                <Megaphone className="w-3 h-3" />{t(row.category || "general")}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Hourglass className="w-3 h-3" />
                                                {row.expiresAt ? t("Expires {date}", {date: new Date(row.expiresAt).toLocaleDateString(locale)}) : t("no expiry")}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {row.date ? new Date(row.date).toLocaleString(locale) : "—"}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />{row.location || "—"}
                                            </span>
                                        </>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />{row.clubName || "unmatched"}
                                        {row.clubIsRemembered && (
                                            <Sparkles
                                                className="w-3 h-3 text-blue-500"
                                                aria-label={t("Club remembered from an earlier decision")}
                                            />
                                        )}
                                    </span>
                                    <a
                                        href={row.postUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={t("Open @{name}'s post on Instagram", {name: row.clubUsername})}
                                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        <Instagram className="w-3 h-3" />@{row.clubUsername}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                    {row.status !== "pending" && (
                                        <span className="capitalize font-bold">{t(row.status)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                                <a
                                    href={row.postUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:text-pink-400 dark:hover:bg-pink-900/30 rounded-lg transition-colors"
                                    title={t("Open the source Instagram post")}
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>

                                {(row.createdEventId || row.createdAnnouncementId) && (
                                    <a
                                        href={
                                            row.createdAnnouncementId
                                                ? `/announcements/${row.createdAnnouncementId}`
                                                : `/event/${row.createdEventId}`
                                        }
                                        target="_blank"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title={row.createdAnnouncementId ? t("View published announcement") : t("View published event")}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                {row.status === "pending" && (
                                    <button
                                        onClick={() => setSelected(row)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                                    >
                                        {t("Review")}</button>
                                )}
                                <button
                                    onClick={() => handleDelete(row)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title={t("Delete candidate")}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pagination && (
                <div className="pb-6">
                    <PaginationBar pagination={pagination} onPageChange={setPage} />
                </div>
            )}

            {selected && (
                <ReviewModal
                    row={selected}
                    clubs={clubs}
                    onClose={() => setSelected(null)}
                    onApproved={handleApproved}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onPatched={(updated) =>
                        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                    }
                />
            )}
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * Review modal — the source post beside an editable approve form.
 * ------------------------------------------------------------------------- */
function ReviewModal({
    row, clubs, onClose, onApproved, onReject, onDelete, onPatched,
}: {
    row: IScrapedEvent;
    clubs: ClubData[];
    onClose: () => void;
    onApproved: (row: IScrapedEvent, kind: ScrapedEventKind, publishedId?: string) => void;
    onReject: (row: IScrapedEvent, reason: string) => void;
    onDelete: (row: IScrapedEvent) => void;
    onPatched: (row: IScrapedEvent) => void;
}) {
  const {t, locale} = useUI();
    const extracted = splitDateTime(row.date);

    // The server decides which approve endpoint a row accepts, so a
    // reclassification is a PATCH first — never a local-only toggle.
    const [kind, setKind] = useState<ScrapedEventKind>(row.kind);
    const [isSwitchingKind, setIsSwitchingKind] = useState(false);
    const isAnnouncement = kind === "announcement";

    // Shared with the event form: title, description (= the announcement body),
    // club routing, cover image and tags all mean the same thing on both sides.
    const [ann, setAnn] = useState({
        category: (row.category || "general") as AnnouncementCategory,
        link: row.link || "",
        expiresAt: row.expiresAt || "",
        isPinned: false,
    });

    const [form, setForm] = useState<IScrapedEventApprove>({
        clubId: row.clubId || "",
        title: row.title || "",
        description: row.description || "",
        date: extracted.date,
        startTime: extracted.time || "18:00",
        endTime: addHours(extracted.time || "18:00", 2),
        duration: 2,
        locationType: "on-campus",
        location: row.location || "",
        coverImage: row.postImageUrl || "",
        tags: [],
        publishAsAdmin: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [showCaption, setShowCaption] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const set = <K extends keyof IScrapedEventApprove>(k: K, v: IScrapedEventApprove[K]) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    // Keep endTime in step with startTime + duration, as the ticket asks.
    const setStart = (time: string) => {
        setForm((prev) => ({ ...prev, startTime: time, endTime: addHours(time, prev.duration ?? 2) }));
    };
    const setDuration = (hours: number) => {
        setForm((prev) => ({ ...prev, duration: hours, endTime: addHours(prev.startTime || "", hours) }));
    };

    // True once the admin edits the cover away from the source post image.
    const isCoverOverridden =
        !!form.coverImage && form.coverImage !== (row.postImageUrl || "");

    const missing = [
        !form.clubId && !form.publishAsAdmin && "club",
        !form.title?.trim() && "title",
        isAnnouncement ? !form.description?.trim() && "body" : !form.date && "date",
        !isAnnouncement && !form.location?.trim() && "location",
    ].filter(Boolean) as string[];

    // Persist the reclassification before publishing — the approve endpoints
    // reject each other's rows.
    const handleKindChange = async (next: ScrapedEventKind) => {
        if (next === kind || isSwitchingKind) return;
        setIsSwitchingKind(true);
        setModalError(null);
        try {
            const res = await updateScrapedEvent(row.id, { kind: next });
            if (res.data) onPatched(res.data);
            setKind(next);
        } catch (err: any) {
            setModalError(err?.message || "Could not change the kind.");
        } finally {
            setIsSwitchingKind(false);
        }
    };

    // Persist extraction fixes without publishing.
    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        setModalError(null);
        try {
            const res = await updateScrapedEvent(row.id, {
                title: form.title || undefined,
                description: form.description || undefined,
                clubId: form.clubId || undefined,
                ...(isAnnouncement
                    ? {
                        category: ann.category,
                        link: ann.link || undefined,
                        expiresAt: ann.expiresAt || undefined,
                    }
                    : {
                        date: form.date ? `${form.date}T${form.startTime || "00:00"}:00` : undefined,
                        location: form.location || undefined,
                    }),
            });
            if (res.data) onPatched(res.data);
            setModalError(null);
            onClose();
        } catch (err: any) {
            setModalError(err?.message || "Save failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        setIsSubmitting(true);
        setModalError(null);
        try {
            // Sending coverImage marks it an override and skips server-side
            // re-hosting, so omit it when it's still the prefilled source URL.
            const coverImage = isCoverOverridden ? form.coverImage : undefined;
            const clubId = form.publishAsAdmin ? undefined : form.clubId;
            const tags = form.tags?.length ? form.tags : undefined;

            if (isAnnouncement) {
                const res = await approveScrapedAnnouncement(row.id, {
                    clubId,
                    publishAsAdmin: form.publishAsAdmin,
                    title: form.title,
                    body: form.description,
                    category: ann.category,
                    link: ann.link || undefined,
                    expiresAt: ann.expiresAt || undefined,
                    isPinned: ann.isPinned,
                    coverImage,
                    tags,
                });
                onApproved(row, "announcement", res.data?.id);
            } else {
                const res = await approveScrapedEvent(row.id, {
                    ...form,
                    clubId,
                    tags,
                    coverImage,
                });
                onApproved(row, "event", res.data?.id);
            }
        } catch (err: any) {
            // 400/409 details from the backend are admin-readable — show them verbatim.
            setModalError(err?.message || "Approve failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-transparent dark:border-gray-700">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("Review candidate")}</h3>
                        <KindBadge kind={kind} />
                        <ConfidenceBadge value={row.confidence} />
                    </div>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                </div>

                {row.confidence < LOW_CONFIDENCE && (
                    <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            {t("The extractor was unsure about this post — check every field against the caption.")}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* --- LEFT: the source post --- */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className={labelClass + " mb-0"}>{t("Source post")}</span>
                            <a
                                href={row.postUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <Instagram className="w-3.5 h-3.5" />@{row.clubUsername}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {row.postImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={resolveImageUrl(row.postImageUrl)}
                                alt={t("Instagram post")}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 mb-3"
                            />
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                            {t("Posted")} {new Date(row.postedAt).toLocaleString(locale)}
                        </p>

                        {row.postCaption && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                                <p
                                    className={`text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap ${
                                        showCaption ? "max-h-72 overflow-y-auto" : "line-clamp-4"
                                    }`}
                                >
                                    {row.postCaption}
                                </p>
                                <button
                                    onClick={() => setShowCaption((v) => !v)}
                                    className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {showCaption ? t("Show less") : t("Show full caption")}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: the editable form --- */}
                    <div className="space-y-4">
                        {/* Misclassification escape hatch — saved immediately, because
                            the approve endpoints refuse each other's rows. */}
                        <div>
                            <label className={labelClass}>
                                {t("Publish as")}{isSwitchingKind && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
                            </label>
                            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                {(["event", "announcement"] as ScrapedEventKind[]).map((k) => (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => handleKindChange(k)}
                                        disabled={isSwitchingKind || isSubmitting}
                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                                            kind === k
                                                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                        }`}
                                    >
                                        {k === "event" ? <CalendarDays className="w-3.5 h-3.5" /> : <Megaphone className="w-3.5 h-3.5" />}
                                        {k}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {isAnnouncement
                                    ? t("Announcements are the “act on this” posts — openings, deadlines, applications, sales.")
                                    : t("Events have a date and a place people show up at.")}
                            </p>
                        </div>

                        {/* Club picker — prominent when unmatched, muted when publishing as admin */}
                        <div className={!row.clubId && !form.publishAsAdmin ? "p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : ""}>
                            <label className={labelClass}>
                                {t("Club")} {!form.publishAsAdmin && <span className="text-red-500">*</span>}
                                {!row.clubId && !form.publishAsAdmin && (
                                    <span className="ml-2 normal-case font-medium text-red-600 dark:text-red-400">
                                        @{row.clubUsername}  {t("isn't linked to a club — pick one")}</span>
                                )}
                                {row.clubIsRemembered && !form.publishAsAdmin && (
                                    <span
                                        title={t("Learned from an earlier decision about @{name} — still editable", {name: row.clubUsername})}
                                        className="ml-2 inline-flex items-center gap-1 normal-case font-medium text-blue-600 dark:text-blue-400"
                                    >
                                        <Sparkles className="w-3 h-3" />  {t("remembered")}</span>
                                )}
                            </label>
                            <select
                                value={form.clubId}
                                onChange={(e) => set("clubId", e.target.value)}
                                disabled={!!form.publishAsAdmin}
                                className={inputClass + (form.publishAsAdmin ? " opacity-50" : "")}
                            >
                                <option value="">{t("Select a club…")}</option>
                                {clubs.map((c) => (
                                    <option key={c.id} value={c.id}>{c.clubName}</option>
                                ))}
                            </select>

                            {/* Escape hatch for handles whose club isn't on the platform */}
                            <label className="mt-2.5 flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!form.publishAsAdmin}
                                    onChange={(e) => set("publishAsAdmin", e.target.checked)}
                                    className="w-4 h-4 rounded mt-0.5"
                                />
                                <span>
                                    <span className="inline-flex items-center gap-1 font-bold">
                                        <Shield className="w-3.5 h-3.5" />  {t("Publish as admin")}</span>
                                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                        {t("Publishes under the admin account instead of a club — for handles whose club isn't on the platform. The club selection is ignored.")}</span>
                                </span>
                            </label>
                        </div>

                        <div>
                            <label className={labelClass}>{t("Title")} <span className="text-red-500">*</span></label>
                            <input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                className={inputClass}
                                placeholder={isAnnouncement ? t("Announcement title") : t("Event title")}
                            />
                        </div>

                        {!isAnnouncement && <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>{t("Date")} <span className="text-red-500">*</span></label>
                                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t("Duration (h)")}</label>
                                <input
                                    type="number" min={0.5} step={0.5}
                                    value={form.duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t("Start time")}</label>
                                <input type="time" value={form.startTime} onChange={(e) => setStart(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{t("End time")}</label>
                                <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputClass} />
                            </div>
                        </div>}

                        {!isAnnouncement && <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className={labelClass}>{t("Location")} <span className="text-red-500">*</span></label>
                                <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputClass} placeholder="H402" />
                            </div>
                            <div>
                                <label className={labelClass}>{t("Type")}</label>
                                <select
                                    value={form.locationType}
                                    onChange={(e) => set("locationType", e.target.value as "on-campus" | "off-campus")}
                                    className={inputClass}
                                >
                                    <option value="on-campus">{t("On-campus")}</option>
                                    <option value="off-campus">{t("Off-campus")}</option>
                                </select>
                            </div>
                        </div>}

                        <div>
                            <div className="flex items-end justify-between gap-2 mb-1.5">
                                <label className={labelClass + " mb-0"}>
                                    {isAnnouncement ? <>{t("Body")} <span className="text-red-500">*</span></> : t("Description")}
                                </label>
                                {/* The staged description is an LLM summary; the raw caption
                                    is sometimes the better text. Fills the field, never auto-applies. */}
                                {row.postCaption && (
                                    <button
                                        type="button"
                                        onClick={() => set("description", row.postCaption || "")}
                                        disabled={form.description === row.postCaption}
                                        className="inline-flex items-center gap-1 text-xs font-bold transition-colors
                                                   text-blue-600 hover:underline dark:text-blue-400
                                                   disabled:text-gray-400 disabled:no-underline disabled:cursor-default
                                                   dark:disabled:text-gray-600"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        {form.description === row.postCaption ? t("Using caption") : t("Use original caption")}
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => set("description", e.target.value)}
                                className={inputClass + " h-28 resize-y"}
                            />
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {form.description === row.postCaption
                                    ? t("The post caption, verbatim — trim anything time-relative before publishing.")
                                    : t("A summary of the caption. Edit freely.")}
                            </p>
                        </div>

                        {isAnnouncement && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>{t("Category")}</label>
                                        <select
                                            value={ann.category}
                                            onChange={(e) =>
                                                setAnn((p) => ({ ...p, category: e.target.value as AnnouncementCategory }))
                                            }
                                            className={inputClass + " capitalize"}
                                        >
                                            {ANNOUNCEMENT_CATEGORIES.map((c) => (
                                                <option key={c} value={c} className="capitalize">{t(c)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t("Expires on")}</label>
                                        <input
                                            type="date"
                                            value={ann.expiresAt}
                                            onChange={(e) => setAnn((p) => ({ ...p, expiresAt: e.target.value }))}
                                            className={inputClass}
                                        />
                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            {t("Optional — deadlines and application windows read better with one.")}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>{t("Link")}</label>
                                    <input
                                        value={ann.link}
                                        onChange={(e) => setAnn((p) => ({ ...p, link: e.target.value }))}
                                        className={inputClass}
                                        placeholder={t("Application form, listing, ticket page…")}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className={labelClass}>{t("Cover image URL")}</label>
                            <input
                                value={form.coverImage}
                                onChange={(e) => set("coverImage", e.target.value)}
                                className={inputClass}
                                placeholder={t("Defaults to the Instagram post image")}
                            />
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {isCoverOverridden
                                    ? t("Custom URL — published as-is, not copied to storage.")
                                    : t("The post image is copied to storage on approval so it can't expire.")}
                            </p>
                        </div>

                        <div>
                            <label className={labelClass}>{t("Tags (comma separated)")}</label>
                            <input
                                value={form.tags?.join(", ") || ""}
                                onChange={(e) =>
                                    set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                                }
                                className={inputClass}
                                placeholder="ai, talk"
                            />
                        </div>

                        {isAnnouncement && (
                            <label className="flex items-start gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ann.isPinned}
                                    onChange={(e) => setAnn((p) => ({ ...p, isPinned: e.target.checked }))}
                                    className="w-4 h-4 rounded mt-0.5"
                                />
                                <span>
                                    <span className="inline-flex items-center gap-1 font-bold">
                                        <Pin className="w-3.5 h-3.5" />  {t("Pin to the top")}</span>
                                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                        {t("Keeps it above other announcements until it expires.")}</span>
                                </span>
                            </label>
                        )}

                        {!isAnnouncement && <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>{t("Registration link")}</label>
                                <input
                                    value={form.registrationLink || ""}
                                    onChange={(e) => set("registrationLink", e.target.value || null)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t("Capacity")}</label>
                                <input
                                    type="number" min={1}
                                    value={form.capacity ?? ""}
                                    onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)}
                                    className={inputClass}
                                />
                            </div>
                        </div>}

                        {!isAnnouncement && (
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={!!form.isRegistrationOpen}
                                    onChange={(e) => set("isRegistrationOpen", e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                {t("Registration is open")}</label>
                        )}
                    </div>
                </div>

                {/* Errors from the backend, verbatim */}
                {modalError && (
                    <div className="mx-5 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{t(modalError)}</p>
                    </div>
                )}

                {/* Reject form */}
                {isRejecting && (
                    <div className="mx-5 mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                        <label className={labelClass}>{t("Rejection reason (optional)")}</label>
                        <div className="flex gap-2">
                            <input
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className={inputClass}
                                placeholder={t("not an event")}
                            />
                            <button
                                onClick={() => onReject(row, rejectionReason)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm whitespace-nowrap transition-colors"
                            >
                                {t("Confirm reject")}</button>
                        </div>
                    </div>
                )}

                {/* Footer actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onDelete(row)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title={t("Delete candidate")}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsRejecting((v) => !v)}
                            className="px-3 py-2 text-red-600 dark:text-red-400 font-bold text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-1.5 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />  {t("Reject")}</button>
                    </div>

                    <div className="flex items-center gap-2">
                        {missing.length > 0 && (
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 mr-1">
                                {t("Missing:")} {missing.map((field) => t(field)).join(", ")}
                            </span>
                        )}
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSubmitting || isSwitchingKind}
                            className="px-3 py-2 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-4 h-4" />  {t("Save fixes")}</button>
                        <button
                            onClick={handleApprove}
                            disabled={isSubmitting || isSwitchingKind || missing.length > 0}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            {t("Approve & publish")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------------------------------------------------------
 * Handle -> publisher mappings. Learned whenever an admin assigns a club to a
 * candidate or approves one; the next post from that handle imports pre-matched.
 * Distinct from a club's self-declared igUsername — this mapping wins.
 * ------------------------------------------------------------------------- */
function IgMappingsSection() {
  const {t, locale} = useUI();
    const [mappings, setMappings] = useState<IIgClubMapping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getIgClubMappings();
            setMappings(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err?.message || "Failed to load mappings.");
            setMappings([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const forget = async (clubUsername: string) => {
        if (!confirm(t("Forget @{name}? Future posts from this handle will import unmatched.", {name: clubUsername}))) return;
        setMappings((prev) => prev.filter((m) => m.clubUsername !== clubUsername));
        try {
            await deleteIgClubMapping(clubUsername);
        } catch (err: any) {
            setError(err?.message || "Failed to forget mapping.");
            load();
        }
    };

    return (
        <div className="m-5 mb-0 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{t("Instagram handle → publisher")}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {t("learned from your club picks and approvals")}</span>
            </div>

            {error && (
                <p className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{t(error)}</p>
            )}

            {isLoading ? (
                <div className="p-6 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
            ) : mappings.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400 dark:text-gray-600">
                    {t("No mappings yet — they appear once you assign a club to a candidate or approve one.")}</p>
            ) : (
                <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {mappings.map((m) => (
                            <tr key={m.clubUsername} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    @{m.clubUsername}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="inline-flex items-center gap-1.5">
                                        {m.isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                                        {m.userName}
                                        {m.isAdmin && (
                                            <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                {t("admin")}</span>
                                        )}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                    {new Date(m.updatedAt).toLocaleDateString(locale)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => forget(m.clubUsername)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title={t("Forget this mapping")}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
