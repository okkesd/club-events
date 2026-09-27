"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { IEvent } from '@/app/lib/types';
import { calculateEndTime } from '@/app/lib/timeUtils';

export default function EventPreviewLink({ event }: { event: IEvent }) {
    const id = useId();
    const linkRef = useRef<HTMLAnchorElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const endTime = calculateEndTime(event.startTime, event.duration);

    const clearTimer = () => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
    };
    const close = () => {
        clearTimer();
        setOpen(false);
        setPosition(null);
    };
    const scheduleOpen = () => {
        clearTimer();
        timer.current = setTimeout(() => setOpen(true), 450);
    };
    const scheduleClose = () => {
        clearTimer();
        timer.current = setTimeout(close, 120);
    };

    useEffect(() => {
        const dismiss = () => {
            if (timer.current) clearTimeout(timer.current);
            setOpen(false);
            setPosition(null);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') dismiss();
        };
        window.addEventListener('scroll', dismiss, true);
        window.addEventListener('resize', dismiss);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            if (timer.current) clearTimeout(timer.current);
            window.removeEventListener('scroll', dismiss, true);
            window.removeEventListener('resize', dismiss);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    useLayoutEffect(() => {
        if (!open || !linkRef.current || !previewRef.current) return;
        const anchor = linkRef.current.getBoundingClientRect();
        const preview = previewRef.current.getBoundingClientRect();
        const left = Math.max(12, Math.min(anchor.left + (anchor.width - preview.width) / 2, window.innerWidth - preview.width - 12));
        const preferredTop = anchor.top - preview.height - 10;
        const top = preferredTop >= 76 ? preferredTop : anchor.bottom + 10;
        setPosition({ left, top: Math.max(12, Math.min(top, window.innerHeight - preview.height - 12)) });
    }, [open]);

    return (
        <>
            <Link
                ref={linkRef}
                href={`/event/${event.id}`}
                aria-label={`${event.title}${event.organizerInstagram ? `, @${event.organizerInstagram}` : ''}, ${event.startTime} - ${endTime}`}
                aria-describedby={open ? id : undefined}
                onPointerEnter={event => {
                    if (event.pointerType === 'mouse') scheduleOpen();
                }}
                onPointerLeave={scheduleClose}
                onFocus={event => {
                    if (event.currentTarget.matches(':focus-visible')) scheduleOpen();
                }}
                onBlur={close}
                onClick={close}
                className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500"
            />
            {open && createPortal(
                <div
                    ref={previewRef}
                    id={id}
                    role="tooltip"
                    onPointerEnter={clearTimer}
                    onPointerLeave={scheduleClose}
                    className="fixed z-[60] w-72 max-w-[calc(100vw-24px)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900 vibrant:border-campus-border vibrant:bg-campus-surface"
                    style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
                >
                    <p className="break-words text-sm font-semibold leading-5 text-gray-900 dark:text-gray-50 vibrant:text-gray-950">{event.title}</p>
                    {event.organizerInstagram && <p className="mt-1.5 break-words text-xs font-medium text-gray-600 dark:text-gray-200 vibrant:text-campus-ink">@{event.organizerInstagram}</p>}
                    {event.description && (
                        <p className="mt-3 line-clamp-3 break-words text-xs leading-5 text-gray-600 dark:text-gray-300 vibrant:text-campus-ink">{event.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs tabular-nums text-blue-600 dark:text-blue-200 vibrant:text-campus-ink">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {event.startTime} – {endTime}
                    </div>
                    {event.location && <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-300 vibrant:text-campus-ink">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="break-words">{event.location}</span>
                    </div>}
                </div>,
                document.body
            )}
        </>
    );
}
