import { ApiError, getAuthHeader, handleApiError, resolveImageUrl } from './api';
import type { AnnouncementCategory } from './types';

export interface SuggestionDraft {
  kind: 'event' | 'announcement';
  method: 'poster' | 'details';
  title: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  link: string;
  category: AnnouncementCategory;
  expiresAt: string;
  email: string;
}

export interface Suggestion extends SuggestionDraft {
  id: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  createdEventId?: string | null;
  createdAnnouncementId?: string | null;
  rejectionReason?: string | null;
}

export const emptySuggestion: SuggestionDraft = {
  kind: 'event', method: 'poster', title: '', description: '', image: '',
  date: '', startTime: '', endTime: '', location: '', organizer: '', link: '',
  category: 'general', expiresAt: '', email: '',
};

export function suggestionMissingInfo(draft: SuggestionDraft): string | null {
  if (draft.image) return null;
  const title = draft.title.trim();
  const description = draft.description.trim();
  if (!title && !description) return 'Not enough information. Add a poster or enter the details.';
  if (!title) return 'Add a poster or enter a title.';
  if (!description) return 'Add a poster or enter a description.';
  if (draft.kind === 'event' && !draft.date) return 'Add a poster or enter the event date.';
  if (draft.kind === 'event' && !draft.location.trim()) return 'Add a poster or enter the event location.';
  if (draft.kind === 'event' && !draft.startTime) return 'Add a poster or enter the start time.';
  if (draft.kind === 'event' && !draft.endTime) return 'Add a poster or enter the end time so we know how long it lasts.';
  return null;
}

const editableFields = ['kind', 'title', 'description', 'date', 'startTime', 'endTime', 'location', 'organizer', 'link', 'category', 'expiresAt'] as const;

async function request(path: string, options: RequestInit = {}, admin = true) {
  const auth = admin ? getAuthHeader() : undefined;
  if (admin && !auth) throw new ApiError('Authentication required', 401);
  const response = await fetch(`/api/proxy${path}`, { ...options, cache: 'no-store', headers: { ...auth, ...options.headers } });
  if (!response.ok) await handleApiError(response);
  const result = await response.json();
  if (result.success === false) throw new Error('Request failed');
  return result;
}

function normalize(raw: Record<string, unknown>): Suggestion {
  const fields = { ...emptySuggestion };
  for (const key of [...editableFields, 'email'] as const) {
    if (typeof raw[key] === 'string') Object.assign(fields, { [key]: raw[key] });
  }
  return { ...raw, ...fields, image: resolveImageUrl(typeof raw.imageUrl === 'string' ? raw.imageUrl : ''), id: String(raw.id), createdAt: String(raw.createdAt), status: raw.status as Suggestion['status'] };
}

export async function submitSuggestion(draft: SuggestionDraft): Promise<void> {
  const body = new FormData();
  for (const key of [...editableFields, 'email'] as const) if (draft[key].trim()) body.append(key, draft[key].trim());
  if (draft.image) {
    const image = await fetch(draft.image);
    body.append('image', await image.blob(), 'poster.' + (draft.image.startsWith('data:image/png') ? 'png' : draft.image.startsWith('data:image/webp') ? 'webp' : 'jpg'));
  }
  await request('/suggestions', { method: 'POST', body }, false);
}

export async function listSuggestions(status = 'pending', page = 1, kind = ''): Promise<{ data: Suggestion[]; meta: { page: number; limit: number; total: number; pendingCount: number } }> {
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status !== 'all') params.set('status', status);
  if (kind) params.set('kind', kind);
  const result = await request(`/admin/suggestions?${params}`);
  return { ...result, data: result.data.map(normalize) };
}

export async function getSuggestion(id: string): Promise<Suggestion> {
  return normalize((await request(`/admin/suggestions/${encodeURIComponent(id)}`)).data);
}

export async function updateSuggestion(id: string, draft: SuggestionDraft): Promise<Suggestion> {
  const body = Object.fromEntries(editableFields.map(key => [key, draft[key].trim() || null]));
  return normalize((await request(`/admin/suggestions/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).data);
}

export async function reviewSuggestion(id: string, status: 'approved' | 'rejected', publisher: { publishAsAdmin?: boolean; clubId?: string; locationType?: string }, rejectionReason = ''): Promise<Suggestion> {
  return normalize((await request(`/admin/suggestions/${encodeURIComponent(id)}/${status === 'approved' ? 'approve' : 'reject'}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(status === 'approved' ? publisher : { rejectionReason: rejectionReason || null }),
  })).data);
}
