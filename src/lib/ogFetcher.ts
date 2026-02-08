/**
 * Fetches Open Graph metadata from a URL using CORS proxies
 */

interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

const CORS_PROXIES = [
  {
    url: 'https://corsproxy.io/?url=',
    parseBody: (res: Response) => res.text(),
  },
  {
    url: 'https://api.allorigins.win/get?url=',
    parseBody: async (res: Response) => {
      const data = await res.json();
      return data.contents as string;
    },
  },
];

// Simple in-memory cache
const cache = new Map<string, { data: OGMetadata; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function extractMetaContent(html: string, property: string): string | undefined {
  // Try og: prefix
  const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'));
  if (ogMatch) return ogMatch[1];

  // Try twitter: prefix
  const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, 'i'));
  if (twitterMatch) return twitterMatch[1];

  // Try regular meta name
  const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
  if (metaMatch) return metaMatch[1];

  return undefined;
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

function extractFavicon(html: string, baseUrl: string): string | undefined {
  // Try to find favicon in link tags
  const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

  if (iconMatch) {
    const iconUrl = iconMatch[1];
    // Convert relative URLs to absolute
    if (iconUrl.startsWith('//')) {
      return `https:${iconUrl}`;
    } else if (iconUrl.startsWith('/')) {
      try {
        const url = new URL(baseUrl);
        return `${url.origin}${iconUrl}`;
      } catch {
        return iconUrl;
      }
    }
    return iconUrl;
  }

  // Fallback to /favicon.ico
  try {
    const url = new URL(baseUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) {
    try {
      const base = new URL(baseUrl);
      return `${base.origin}${url}`;
    } catch {
      return url;
    }
  }
  return url;
}

async function fetchViaProxy(targetUrl: string): Promise<string | null> {
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy.url}${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!response.ok) continue;
      const html = await proxy.parseBody(response);
      if (html) return html;
    } catch {
      continue;
    }
  }
  return null;
}

export async function fetchOGMetadata(url: string): Promise<OGMetadata | null> {
  // Check cache first
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const html = await fetchViaProxy(url);
    if (!html) return null;

    const metadata: OGMetadata = {
      title: extractMetaContent(html, 'title') || extractTitle(html),
      description: extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'image'),
      siteName: extractMetaContent(html, 'site_name'),
      favicon: extractFavicon(html, url),
    };

    // Resolve relative image URLs
    if (metadata.image) {
      metadata.image = resolveUrl(metadata.image, url);
    }

    // Cache the result
    cache.set(url, { data: metadata, timestamp: Date.now() });

    return metadata;
  } catch {
    return null;
  }
}

// Preload OG metadata for multiple URLs
export function preloadOGMetadata(urls: string[]): void {
  urls.forEach(url => {
    if (url && !cache.has(url)) {
      fetchOGMetadata(url).catch(() => {});
    }
  });
}
