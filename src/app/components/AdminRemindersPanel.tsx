"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminReminders, type AdminReminder } from "@/app/lib/api";
import { useUI } from "@/i18n/useUI";

const labels = {
  tr: { title: "Etkinlik hatırlatıcıları", note: "Otomatik e-posta gönderimi kapalı.", email: "E-posta", event: "Etkinlik", start: "Etkinlik zamanı", due: "Hatırlatma zamanı", status: "Durum", empty: "Henüz hatırlatıcı kaydı yok.", error: "Kayıtlar yüklenemedi.", retry: "Yenile", loading: "Yükleniyor…", prev: "Önceki", next: "Sonraki", sentAt: "Gönderim zamanı", upcoming: "Gelecek", waiting: "Bekliyor / zamanı geldi", expired: "Etkinlik geçmiş", invalid_time: "Geçersiz saat", pending: "Bekliyor", failed: "Başarısız", sent: "Gönderildi", sending: "Gönderiliyor", unknown: "Belirsiz", skipped: "Atlandı" },
  en: { title: "Event reminders", note: "Automatic email delivery is disabled.", email: "Email", event: "Event", start: "Event time", due: "Reminder time", status: "Status", empty: "No reminders yet.", error: "Could not load reminders.", retry: "Refresh", loading: "Loading…", prev: "Previous", next: "Next", sentAt: "Sent at", upcoming: "Upcoming", waiting: "Waiting / due", expired: "Event passed", invalid_time: "Invalid time", pending: "Pending", failed: "Failed", sent: "Sent", sending: "Sending", unknown: "Unknown", skipped: "Skipped" },
  fr: { title: "Rappels d’événements", note: "L’envoi automatique des e-mails est désactivé.", email: "E-mail", event: "Événement", start: "Date de l’événement", due: "Date du rappel", status: "Statut", empty: "Aucun rappel.", error: "Impossible de charger les rappels.", retry: "Actualiser", loading: "Chargement…", prev: "Précédent", next: "Suivant", sentAt: "Envoyé le", upcoming: "À venir", waiting: "En attente / à envoyer", expired: "Événement passé", invalid_time: "Heure invalide", pending: "En attente", failed: "Échec", sent: "Envoyé", sending: "En cours", unknown: "Inconnu", skipped: "Ignoré" },
};

const statusColors: Record<string, string> = {
  sent: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  waiting: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  unknown: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function AdminRemindersPanel() {
  const { language, locale } = useUI();
  const text = labels[language];
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<AdminReminder[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getAdminReminders(page).then(result => {
      if (!active) return;
      setRows(result.data);
      setTotal(result.pagination.total);
      setPages(result.pagination.totalPages);
    }).catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, refresh]);
  const date = (value: string | null) => value ? new Date(value).toLocaleString(locale, { timeZone: "Europe/Istanbul" }) : "—";
  const button = "rounded-lg border px-3 py-2 disabled:opacity-40";
  return <section className="p-4 sm:p-6 space-y-4 dark:text-gray-100">
    <div className="flex justify-between items-center gap-3">
      <h2 className="text-xl font-semibold">{text.title} ({total})</h2>
      <button className={button} disabled={loading} onClick={() => { setLoading(true); setError(false); setRefresh(v => v + 1); }}>{text.retry}</button>
    </div>
    <p className="text-sm text-gray-500">{text.note} · Europe/Istanbul</p>
    {loading ? <p role="status">{text.loading}</p> : error ? <p role="alert">{text.error}</p> : rows.length === 0 ? <p>{text.empty}</p> : <>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr>{[text.email, text.event, text.start, text.due, text.status, text.sentAt].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.id} className="border-t border-gray-200 dark:border-gray-800">
          <td className="p-3">{row.email}</td>
          <td className="p-3"><Link className="underline" href={`/event/${encodeURIComponent(row.eventId)}`}>{row.eventTitle}</Link></td>
          <td className="p-3 whitespace-nowrap">{date(row.eventStart)}</td>
          <td className="p-3 whitespace-nowrap">{date(row.dueAt)}</td>
          <td className="p-3"><span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[row.displayStatus] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
            {text[row.displayStatus as keyof typeof text] ?? row.status}
          </span></td>
          <td className="p-3 whitespace-nowrap">{date(row.sentAt)}</td>
        </tr>)}</tbody>
      </table></div>
    </>}
    <div className="flex items-center justify-end gap-3">
      <button className={button} disabled={loading || page <= 1} onClick={() => { setLoading(true); setError(false); setPage(p => p - 1); }}>{text.prev}</button>
      <span>{page} / {Math.max(1, pages)}</span>
      <button className={button} disabled={loading || page >= pages} onClick={() => { setLoading(true); setError(false); setPage(p => p + 1); }}>{text.next}</button>
    </div>
  </section>;
}
