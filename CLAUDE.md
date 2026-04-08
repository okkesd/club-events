# Club Events — Frontend (Next.js)

## What is this project?

A university club management platform where clubs can post events and announcements, and students can browse, subscribe, and stay updated. This is the **frontend** — a Next.js 16 app (React 19, Tailwind CSS 4, TypeScript).

The **backend** is a separate FastAPI (Python) app located at `/home/debianokkes/okkes/api_club_events/`.

## Architecture

- **Frontend** (this repo): Next.js app at `localhost:3000`
- **Backend**: FastAPI at `localhost:8000` (env: `BACKEND_URL`)
- **Proxy**: All API calls go through Next.js proxy at `/api/proxy/[...path]` → forwards to FastAPI. The proxy adds `x-api-key`, `X-Forwarded-For`, `X-Visitor-Id` headers and handles caching/revalidation.
- **Auth**: JWT tokens stored in `localStorage`. Login sends form-data (OAuth2 style). Protected routes send `Authorization: Bearer <token>` header.
- **Images**: Uploaded via `/api/proxy/upload`, stored in Supabase or as relative paths resolved by `resolveImageUrl()`.

## Key directories

```
src/app/
├── admin/           # Admin panel (club approval, subscribers, messages)
├── announcements/   # Browse & create announcements
├── club/[id]/       # Individual club profile
├── clubs/           # Browse all clubs
├── event/[id]/      # Event detail page
├── event/create/    # Create event form
├── events/          # Browse all events
├── main/            # Main landing page (weekly calendar)
├── login/ & signup/ # Auth pages
├── legal/           # Privacy & cookie policy
├── about-us/        # About page
├── contact/         # Contact form
├── unsubscribe/     # Email unsubscribe via token
├── components/      # Shared components (EventForm, AnnouncementForm, SubscribeForm, Navbar, etc.)
├── context/         # AuthContext (React context for user state)
├── lib/             # api.ts (all API calls), types.ts (all interfaces), dateUtils.ts
├── api/proxy/       # Next.js API route that proxies to FastAPI backend
└── providers/       # Theme provider (next-themes)
```

## Core features

1. **Clubs**: Register, get admin-verified, manage profile (logo, banner, description)
2. **Events**: Clubs create events with date/time/location/cover image. Students browse by week, search, filter. IP-based like dedup.
3. **Announcements**: Clubs post categorized announcements (internship, job, scholarship, competition, recruitment, academic, workshop, general). Supports pinning, expiry, tags, cover images.
4. **Subscriptions**: Two types:
   - **Announcement subscribe** (`POST /subscribe`): User picks categories and/or clubs. Sends `{ email, categories: ["workshop"], clubIds: ["abc"] }`. Empty arrays = subscribe to all.
   - **Club subscribe** (`POST /clubs/{clubId}/subscribe`): Subscribe to a specific club. Sends `{ email }`.
   - Weekly digest email sent to subscribers.
5. **Admin panel** (`/admin`): Tabs for pending/verified/blocked clubs, contact messages, and subscribers table.
6. **Contact form**: Public form that sends messages viewable by admin.

## API data shapes (current)

Subscription response from backend:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "clubs": [{"clubId": "uuid", "clubName": "Chess Club", "isActive": true}],
  "categories": [{"category": "workshop", "isActive": true}],
  "isActive": true,
  "createdAt": "ISO datetime"
}
```

Subscribe request body:
```json
{ "email": "user@example.com", "categories": ["workshop"], "clubIds": ["uuid"] }
```

Backend returns snake_case for some fields (e.g. `has_liked`, `view_count`, `error_msg`). The frontend normalizes these in `api.ts` via `normalizeEvent()` and type mappings.

## User signals

- When the user types just `.` (a single dot), it means **check the bridge** — there should be a new message or ticket update. Always run `check_inbox` immediately.

## Agent Bridge

You are the "frontend" agent. There is a "backend" agent working in `/home/debianokkes/okkes/api_club_events/`.
You share a communication bridge via MCP (server name: "bridge").

Rules:
- When you change something that affects the API contract (request/response shapes, endpoints, headers), create a ticket or send a message to notify backend.
- When you see bridge messages in the conversation, read and act on them.
- When you need something from backend (new endpoint, schema change, clarification), create a ticket with create_ticket.
- When a ticket you created is resolved, verify the change works for you, then close it with close_ticket.
- Keep ticket messages concise — the other agent has limited context too.
- One open ticket at a time.

### Ticket lifecycle
Tickets follow a strict lifecycle: open → in_progress → resolved → closed.
- Creator calls create_ticket → status becomes open.
- Non-creator calls add_to_ticket to comment → status becomes in_progress.
- Non-creator calls resolve_ticket with a summary when done → status becomes resolved.
- Creator calls close_ticket to confirm and close → status becomes closed.
- Only the non-creator can resolve; only the creator can close.
- Always check inbox (check_inbox) for ticket updates before acting on tickets.

## Styling

- Tailwind CSS 4 with three theme variants: light (default), `dark:`, and `vibrant:` (colorful purple theme)
- Icons: lucide-react
- Design: rounded-2xl cards, consistent spacing, transitions, hover effects

## Dev commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```
