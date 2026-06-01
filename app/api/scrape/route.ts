import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { targetUrl } = await request.json();
    if (!targetUrl) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const url = new URL(targetUrl);
    const fallback = {
      title: url.hostname,
      iconUrl: `${url.origin}/favicon.ico`,
    };

    // Fetching on the server to bypass CORS
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    if (!response.ok) return NextResponse.json(fallback);

    const html = await response.text();
    
    // use a simple regex to get the title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : fallback.title;

    
    return NextResponse.json({ title, iconUrl: fallback.iconUrl });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to scrape target' }, { status: 500 });
  }
}