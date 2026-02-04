// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const tagsParam = request.nextUrl.searchParams.get('tags'); // "events,clubs"

  if (secret !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (!tagsParam) {
    return NextResponse.json({ message: 'Missing tags' }, { status: 400 });
  }

  // Split string into array: "events,clubs" -> ["events", "clubs"]
  const tags = tagsParam.split(',');

  // Loop through and revalidate each one
  tags.forEach(tag => {
      revalidateTag(tag.trim(), "max");
      console.log(`Purged cache for tag: ${tag}`);
  });

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}