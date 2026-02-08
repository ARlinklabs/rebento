import type { BentoCard, BentoImportData, CardSize, CardType, UserProfile, Theme, SocialPlatform } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Social platform URL detection ---

const SOCIAL_PLATFORM_PATTERNS: { platform: SocialPlatform; hosts: string[]; pathRe: RegExp }[] = [
  { platform: 'twitter', hosts: ['twitter.com', 'x.com'], pathRe: /^\/([a-zA-Z0-9_]+)\/?$/ },
  { platform: 'youtube', hosts: ['youtube.com'], pathRe: /^\/@?([a-zA-Z0-9_-]+)\/?$|^\/c\/([a-zA-Z0-9_-]+)\/?$|^\/channel\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'instagram', hosts: ['instagram.com'], pathRe: /^\/([a-zA-Z0-9_.]+)\/?$/ },
  { platform: 'github', hosts: ['github.com'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'linkedin', hosts: ['linkedin.com'], pathRe: /^\/in\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'threads', hosts: ['threads.net'], pathRe: /^\/@?([a-zA-Z0-9_.]+)\/?$/ },
  { platform: 'behance', hosts: ['behance.net'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'dribbble', hosts: ['dribbble.com'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'pinterest', hosts: ['pinterest.com'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'paypal', hosts: ['paypal.me'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
  { platform: 'telegram', hosts: ['t.me', 'telegram.me'], pathRe: /^\/([a-zA-Z0-9_]+)\/?$/ },
  { platform: 'contra', hosts: ['contra.com'], pathRe: /^\/([a-zA-Z0-9_-]+)\/?$/ },
];

function detectSocialPlatform(href: string): { platform: SocialPlatform; username: string } | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }

  const hostname = url.hostname.replace(/^www\./, '');

  for (const entry of SOCIAL_PLATFORM_PATTERNS) {
    if (!entry.hosts.some(h => hostname === h)) continue;
    const match = url.pathname.match(entry.pathRe);
    if (!match) continue;
    const username = match.slice(1).find(g => g !== undefined);
    if (!username) continue;
    return { platform: entry.platform, username };
  }
  return null;
}

// --- Size & position parsing ---

function parseBentoSize(style?: { desktop?: string; mobile?: string }): { w: number; h: number } {
  const sizeStr = style?.desktop || '2x2';
  const parts = sizeStr.split('x');
  return {
    w: parseInt(parts[0]) || 2,
    h: parseInt(parts[1]) || 2,
  };
}

function mapSizeFromDimensions(w: number, h: number): CardSize {
  // Bento uses doubled units: w=2 → 1 col, w=4 → 2 cols, h=2 → 1 row, h=4 → 2 rows
  const colSpan = Math.max(Math.round(w / 2), 1);
  const rowSpan = Math.max(Math.round(h / 2), 1);
  const isWide = colSpan >= 2;
  const isTall = rowSpan >= 2;

  if (isWide && isTall) return 'large';
  if (isWide) return 'wide';
  if (isTall) return 'tall';
  return 'small';
}

function sortByPosition(items: any[]): any[] {
  return [...items].sort((a, b) => {
    const ay = a.position?.desktop?.y ?? 0;
    const by = b.position?.desktop?.y ?? 0;
    if (ay !== by) return ay - by;
    const ax = a.position?.desktop?.x ?? 0;
    const bx = b.position?.desktop?.x ?? 0;
    return ax - bx;
  });
}

// --- Card type mapping ---

function mapCardType(bentoType?: string): CardType {
  switch (bentoType) {
    case 'link': return 'link';
    case 'media': return 'image';
    case 'rich-text': return 'text';
    case 'section-header': return 'section-header';
    default: return 'link';
  }
}

// --- Rich text extraction ---

function extractPlainText(doc: any): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (typeof doc !== 'object') return String(doc);

  if (doc.text) return doc.text;

  if (Array.isArray(doc.content)) {
    return doc.content
      .map((node: any) => extractPlainText(node))
      .filter(Boolean)
      .join(doc.type === 'doc' ? '\n' : '');
  }

  return '';
}

// --- Profile mapping ---

function mapProfile(bentoProfile: any): UserProfile {
  const name = bentoProfile.name || bentoProfile.handle || 'Imported Profile';
  const bio = extractPlainText(bentoProfile.bio) || bentoProfile.description || '';
  const avatar = bentoProfile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return { name, bio, avatar };
}

// --- Card mapping ---

function mapCard(item: any): BentoCard | null {
  const { data, position } = item;
  if (!data) return null;

  const cardType = mapCardType(data.type);
  const { w, h } = parseBentoSize(data.style);
  const size = mapSizeFromDimensions(w, h);

  const card: BentoCard = {
    id: generateId(),
    type: cardType,
    size,
  };

  switch (cardType) {
    case 'link': {
      const socialMatch = data.href ? detectSocialPlatform(data.href) : null;
      if (socialMatch) {
        card.type = 'social';
        card.socialPlatform = socialMatch.platform;
        card.socialUsername = socialMatch.username;
        card.socialUrl = data.href;
      } else {
        card.linkUrl = data.href || '';
        card.linkTitle = extractPlainText(data.overrides?.title) || extractPlainText(data.fallback?.title) || '';
        card.linkDescription = extractPlainText(data.overrides?.description) || extractPlainText(data.fallback?.description) || '';
        card.linkImage = data.overrides?.image || data.fallback?.image || '';
        card.linkFavicon = data.fallback?.favicon || '';
        card.title = card.linkTitle || card.linkUrl || 'Link';
      }
      break;
    }
    case 'image': {
      // Media cards store image URL in data.url, data.overrides.image, or data.href
      card.imageUrl = data.url || data.overrides?.image || data.content?.image || data.href || '';
      card.caption = extractPlainText(data.caption) || '';
      card.title = card.caption;
      if (data.href) {
        card.linkUrl = data.href;
      }
      break;
    }
    case 'text': {
      card.content = extractPlainText(data.content);
      card.richContent = data.content;
      break;
    }
    case 'section-header': {
      card.content = extractPlainText(data.title) || extractPlainText(data.content) || extractPlainText(data.overrides?.title) || '';
      card.size = 'wide';
      break;
    }
  }

  // Apply background color if present
  if (data.style?.backgroundColor) {
    card.bgColor = data.style.backgroundColor;
  }

  return card;
}

// --- Main export ---

export function mapBentoToRebento(bentoProfile: any): BentoImportData {
  const profile = mapProfile(bentoProfile);

  const bentoItems: any[] = bentoProfile.bento?.items || [];
  // Sort by position (top-to-bottom, left-to-right) for CSS grid auto-flow
  const sortedItems = sortByPosition(bentoItems);
  const cards = sortedItems
    .map(mapCard)
    .filter((card): card is BentoCard => card !== null);

  const theme: Theme = {
    backgroundColor: bentoProfile.bento?.theme?.backgroundColor || '#ffffff',
    accentColor: bentoProfile.bento?.theme?.accentColor || '#ec4899',
    isDarkMode: false,
  };

  return { profile, cards, theme };
}

// Re-export for tests
export { extractPlainText, detectSocialPlatform, parseBentoSize };
