import type { BentoImportData } from '@/types';
import { mapBentoToRebento } from './bentoMapper';

const CORS_PROXIES = [
  {
    url: 'https://api.allorigins.win/get?url=',
    parseBody: async (res: Response) => {
      const data = await res.json();
      return data.contents as string;
    },
  },
  {
    url: 'https://api.codetabs.com/v1/proxy?quest=',
    parseBody: (res: Response) => res.text(),
  },
  {
    url: 'https://corsproxy.io/?url=',
    parseBody: (res: Response) => res.text(),
  },
];

function normalizeBentoUrl(input: string): string {
  let url = input.trim();

  // Handle bare username like "username" or "bento.me/username"
  if (!url.includes('://')) {
    if (!url.includes('bento.me')) {
      url = `https://bento.me/${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Ensure https
  url = url.replace(/^http:\/\//, 'https://');

  return url;
}

export function isValidBentoUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Accept bare username (alphanumeric, hyphens, underscores)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) return true;

  // Accept bento.me/username patterns
  if (/^(https?:\/\/)?(www\.)?bento\.me\/[a-zA-Z0-9_-]+\/?$/.test(trimmed)) return true;

  return false;
}

export function extractNextData(html: string): any {
  const match = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
  if (!match?.[1]) {
    throw new Error('Could not find __NEXT_DATA__ in the page. The profile may be private or the page structure has changed.');
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error('Failed to parse profile data. The page structure may have changed.');
  }
}

async function fetchViaProxy(targetUrl: string): Promise<string> {
  const errors: string[] = [];

  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy.url}${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        errors.push(`${proxy.url}: status ${response.status}`);
        continue;
      }
      const html = await proxy.parseBody(response);
      if (html) return html;
      errors.push(`${proxy.url}: empty response`);
    } catch (e) {
      errors.push(`${proxy.url}: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  }

  throw new Error(`Failed to fetch profile via all proxies. ${errors.join('; ')}`);
}

export async function fetchBentoProfile(input: string): Promise<BentoImportData> {
  const url = normalizeBentoUrl(input);

  const html = await fetchViaProxy(url);

  // Check for 404 or error pages
  if (html.includes('<title>404') || html.includes('Page not found')) {
    throw new Error('Profile not found. Please check the username and try again.');
  }

  const nextData = extractNextData(html);

  const profile = nextData?.props?.pageProps?.profile;
  if (!profile) {
    throw new Error('Could not extract profile data. This might not be a valid Bento profile page.');
  }

  return mapBentoToRebento(profile);
}
