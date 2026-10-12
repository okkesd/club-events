import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const nativeRequire = createRequire(import.meta.url);
let respond;
function load(file, overrides = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, { exports, Date, URLSearchParams, console,
    require: name => overrides[name] ?? nativeRequire(name),
    fetch: async url => respond(new URL(url, 'http://localhost')),
  });
  return exports;
}
const cinema = load('src/app/lib/cinema.ts');
const time = load('src/app/lib/timeUtils.ts');
const row = changes => ({
  id: 'morning', filmId: 'paris', title: 'Paris, Texas', venue: 'Majestik',
  startsAt: '2026-10-13T11:45:00', endsAt: '2026-10-13T14:10:00',
  description: 'Film', imageUrl: null, sourceUrl: 'https://biletinial.com/tr-tr/sinema/paris-texas',
  ticketUrl: null, auditorium: 'Salon 1', ...changes,
});
const input = [
  row({ id: 'evening', startsAt: '2026-10-13T18:30:00', endsAt: '2026-10-13T20:55:00' }),
  row({}),
  row({ id: 'other-room', auditorium: 'Salon 2' }),
  row({ id: 'atlas', venue: 'Atlas 1948', startsAt: '2026-10-13T20:00:00', endsAt: null }),
];
const events = input.map(cinema.screeningToEvent);
assert.equal(events.length, 4, 'Grid keeps every session');
assert.equal(new Set(events.map(event => event.id)).size, 4);
assert.equal(events[1].duration, 145 / 60);
assert.equal(time.eventTimeLabel(events[3]), '20:00', 'Unknown runtime must not invent an end time');
assert.equal(time.eventTimeLabel(events[0]), '18:30 - 20:55');
assert.ok(events.every(event => event.detailHref.startsWith('/film/paris#screening-')));
const grouped = cinema.groupFilmsForDay(events);
assert.equal(grouped.length, 1, 'One film per day across cinemas and rooms');
assert.equal(grouped[0].detailHref, '/film/paris');
assert.equal(JSON.stringify(grouped[0].screeningGroups), JSON.stringify([
  { venue: 'Majestik', times: ['11:45', '18:30'] }, { venue: 'Atlas 1948', times: ['20:00'] },
]));
assert.ok(events.every(event => !event.screeningGroups), 'Grouping cannot mutate grid events');
assert.equal(cinema.groupFilmsForDay([...events, cinema.screeningToEvent(row({
  id: 'next-day', startsAt: '2026-10-14T11:45:00', endsAt: null,
}))]).length, 2, 'Same film on different days is retained');
assert.equal(cinema.groupFilmsForDay([...events, cinema.screeningToEvent(row({
  id: 'akira', filmId: 'akira', title: 'Akira',
}))]).length, 2, 'Different films remain separate');
const school = { ...events[1], id: 'school', cinemaFilmId: undefined, detailHref: undefined };
assert.equal(cinema.groupFilmsForDay([school])[0], school, 'School events retain their existing behavior');

const ui = { useUI: () => ({ t: text => text, locale: 'tr-TR' }) };
const Link = ({ children, ...props }) => React.createElement('a', props, children);
const { ListViewDay } = load('src/app/main/components/ListViewDay.tsx', {
  'next/link': Link, '@/i18n/useUI': ui, '@/app/lib/timeUtils': time,
  './ListEventLikeButton': () => React.createElement('button', { 'data-like': true }),
});
const markup = renderToStaticMarkup(React.createElement(ListViewDay, {
  day: new Date(2026, 9, 13), events: grouped,
}));
assert.equal((markup.match(/Paris, Texas/g) ?? []).length, 1);
assert.ok(markup.includes('11:45 · 18:30') && markup.includes('20:00'));
assert.ok(!markup.includes('14:10') && !markup.includes('20:55'), 'List shows start times only');
assert.ok(markup.includes('href="/film/paris"') && !markup.includes('data-like'));
const schoolMarkup = renderToStaticMarkup(React.createElement(ListViewDay, {
  day: new Date(2026, 9, 13), events: [school],
}));
assert.ok(schoolMarkup.includes('href="/event/school"') && schoolMarkup.includes('data-like'));

for (const count of [0, 1, 100, 205]) {
  const requests = [];
  respond = url => {
    assert.equal(url.pathname, '/api/proxy/sinefil/screenings');
    assert.equal(url.searchParams.get('week'), '2026-10-12');
    const page = Number(url.searchParams.get('page'));
    requests.push(page);
    return { ok: true, json: async () => ({ success: true,
      data: Array.from({ length: Math.min(100, Math.max(0, count - (page - 1) * 100)) },
        (_, index) => row({ id: String((page - 1) * 100 + index) })),
      pagination: { totalPages: Math.ceil(count / 100) },
    }) };
  };
  assert.equal((await cinema.fetchCinemaWeek('2026-10-12')).length, count);
  assert.deepEqual(requests, Array.from({ length: Math.max(1, Math.ceil(count / 100)) }, (_, i) => i + 1));
}
respond = url => Number(url.searchParams.get('page')) === 1
  ? { ok: true, json: async () => ({ success: true, data: [row({})], pagination: { totalPages: 2 } }) }
  : { ok: false };
await assert.rejects(cinema.fetchCinemaWeek('2026-10-12'), /Screenings unavailable/);
console.log('Cinema checks passed: per-session grid, per-film daily list, starts-only hours, film links, school cards and pagination.');
