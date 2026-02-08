import type { BentoCard, UserProfile, Theme, SocialPlatform } from '@/types';

const MAX_SIZE = 100 * 1024; // 100KB ArDrive free tier

// ---------------------------------------------------------------------------
// Social platform SVG icons (inline, no external deps)
// ---------------------------------------------------------------------------
const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  threads: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.802-1.063-.689-1.685-1.74-1.752-2.96-.065-1.18.408-2.256 1.33-3.03.88-.74 2.084-1.088 3.48-.98.423.033.853.108 1.283.222a6.44 6.44 0 00-.315-1.052c-.365-.89-1.093-1.516-2.095-1.76-.973-.237-1.987.023-2.76.72-.78.7-1.207 1.68-1.207 2.76 0 .803.246 1.535.72 2.118.47.577 1.13.98 1.913 1.152l-.516 1.918c-1.146-.27-2.1-.88-2.79-1.76-.693-.887-1.074-1.98-1.074-3.168 0-1.56.617-3.004 1.74-4.068 1.12-1.06 2.58-1.55 4.15-1.34 1.72.23 3.02 1.28 3.68 2.97.46 1.16.62 2.56.49 4.18h.02c.768.46 1.392 1.09 1.82 1.85.84 1.48.88 3.38-.1 4.88-1.04 1.58-3.18 2.55-6.02 2.73l-.18.01z"/></svg>`,
  behance: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/></svg>`,
  dribbble: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>`,
  paypal: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.77.77 0 01.757-.629h6.724c2.838 0 5.098.835 5.964 2.45.654 1.208.768 2.57.336 3.986-.617 2.042-2.175 3.453-4.073 3.825.387.207.747.478 1.07.81 1.303 1.358 1.588 3.338.717 5.21l-.023.047c-.09.18-.184.355-.283.524-.566.93-1.402 1.668-2.416 2.146-1.152.545-2.535.818-4.112.818H8.173a.75.75 0 01-.75-.633l-.347-2.52z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
  contra: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22.54 12.43-1.96-.89L12 15.82l-8.58-4.28-1.96.89a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 .26-1.84Z"/><path d="m22.54 16.43-1.96-.89L12 19.82l-8.58-4.28-1.96.89a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 .26-1.84Z"/></svg>`,
};

const SOCIAL_COLORS: Record<SocialPlatform, string> = {
  twitter: '#000',
  youtube: '#dc2626',
  instagram: 'linear-gradient(135deg,#a855f7,#ec4899,#f97316)',
  github: '#111827',
  linkedin: '#2563eb',
  threads: '#000',
  behance: '#2563eb',
  dribbble: '#ec4899',
  pinterest: '#dc2626',
  paypal: '#3b82f6',
  telegram: '#0ea5e9',
  contra: '#f97316',
  layers: '#6366f1',
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  twitter: 'X / Twitter',
  youtube: 'YouTube',
  instagram: 'Instagram',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  threads: 'Threads',
  behance: 'Behance',
  dribbble: 'Dribbble',
  pinterest: 'Pinterest',
  paypal: 'PayPal',
  telegram: 'Telegram',
  contra: 'Contra',
  layers: 'Layers',
};

// ---------------------------------------------------------------------------
// Image compression helper (runs in browser via Canvas)
// ---------------------------------------------------------------------------

/**
 * Compress an image (data-URL or blob URL) to WebP via an offscreen canvas.
 * Returns a base64 data-URL.  Falls back to the original on any error.
 */
async function compressImage(
  src: string,
  maxDim: number,
  quality: number
): Promise<string> {
  // External URLs stay as-is — they don't bloat the bundle
  if (src.startsWith('http://') || src.startsWith('https://')) return src;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const webp = canvas.toDataURL('image/webp', quality);
      // If browser doesn't support WebP encoding, fall back to JPEG
      if (webp.startsWith('data:image/webp')) {
        resolve(webp);
      } else {
        resolve(canvas.toDataURL('image/jpeg', quality));
      }
    };
    img.onerror = () => resolve(src); // give back original on failure
    img.src = src;
  });
}

// ---------------------------------------------------------------------------
// Escape HTML to prevent XSS in user content
// ---------------------------------------------------------------------------
function esc(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Card HTML renderers
// ---------------------------------------------------------------------------

function socialCardHtml(card: BentoCard, isDark: boolean): string {
  const platform = card.socialPlatform || 'twitter';
  const icon = SOCIAL_ICONS[platform] || SOCIAL_ICONS.twitter;
  const bg = SOCIAL_COLORS[platform] || '#000';
  const label = SOCIAL_LABELS[platform] || platform;
  const user = esc(card.socialUsername) || '@username';
  const url = esc(card.socialUrl) || '#';
  const isGradient = bg.startsWith('linear');
  const iconBg = isGradient ? `background:${bg}` : `background:${bg}`;
  const btnBg = isDark ? '#fff' : '#111';
  const btnColor = isDark ? '#111' : '#fff';

  return `<div class="card-inner social-card">
  <div class="social-icon" style="${iconBg}">${icon}</div>
  <p class="social-user">${user}</p>
  <p class="social-label">${label}</p>
  <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-btn" style="background:${btnBg};color:${btnColor}">Follow</a>
</div>`;
}

function textCardHtml(card: BentoCard): string {
  return `<div class="card-inner text-card">
  <p>${esc(card.content) || ''}</p>
</div>`;
}

function imageCardHtml(card: BentoCard, imgSrc: string): string {
  if (!imgSrc) {
    return `<div class="card-inner image-empty"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#9ca3af" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`;
  }
  const caption = card.caption ? `<div class="img-caption">${esc(card.caption)}</div>` : '';
  return `<div class="card-inner image-card"><img src="${esc(imgSrc)}" alt="${esc(card.caption || 'Image')}" loading="lazy"/>${caption}</div>`;
}

function linkCardHtml(card: BentoCard, isDark: boolean): string {
  const url = esc(card.linkUrl) || '#';
  const title = esc(card.linkTitle || card.title) || url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const desc = card.linkDescription ? `<p class="link-desc">${esc(card.linkDescription)}</p>` : '';
  const favicon = card.linkFavicon
    ? `<img src="${esc(card.linkFavicon)}" alt="" class="link-fav" onerror="this.style.display='none'"/>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

  if (card.linkImage) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="card-inner link-card-img">
  <div class="link-preview"><img src="${esc(card.linkImage)}" alt="" loading="lazy"/></div>
  <div class="link-bar">${favicon}<span class="link-title">${title}</span><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></div>
</a>`;
  }

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="card-inner link-card-simple">
  <div class="link-icon-wrap">${favicon}</div>
  <p class="link-title-lg">${title}</p>
  ${desc}
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
</a>`;
}

function mapCardHtml(card: BentoCard): string {
  const loc = esc(card.mapLocation);
  if (!loc) {
    return `<div class="card-inner map-empty"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg><span>No location</span></div>`;
  }
  return `<div class="card-inner map-card">
  <div class="map-bg"></div>
  <div class="map-label"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg><span>${loc}</span></div>
</div>`;
}

function sectionHeaderHtml(card: BentoCard): string {
  return `<div class="section-header">${esc(card.content) || 'Section'}</div>`;
}

// ---------------------------------------------------------------------------
// Size → CSS grid spans
// ---------------------------------------------------------------------------

function sizeToGrid(card: BentoCard): string {
  if (card.type === 'section-header') return 'grid-column:1/-1;grid-row:span 1;';
  const map: Record<string, string> = {
    small: 'grid-column:span 1;grid-row:span 2;',
    medium: 'grid-column:span 1;grid-row:span 2;',
    large: 'grid-column:span 2;grid-row:span 4;',
    wide: 'grid-column:span 2;grid-row:span 2;',
    tall: 'grid-column:span 1;grid-row:span 4;',
  };
  return map[card.size] || map.small;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export interface GetHtmlResult {
  html: string;
  sizeBytes: number;
  sizeKB: number;
  isUnderLimit: boolean;
}

/**
 * Generate a self-contained, single-page HTML website from the current
 * editor state.  Compresses embedded images so the output stays under 100 KB.
 */
export async function getPageHtml(
  profile: UserProfile,
  cards: BentoCard[],
  theme: Theme
): Promise<GetHtmlResult> {
  const isDark = theme.isDarkMode;
  const bg = theme.backgroundColor || '#f5f5f5';
  const accent = theme.accentColor || '#3b82f6';
  const textCol = isDark ? '#f3f4f6' : '#111827';
  const subText = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const cardBorder = isDark ? '#1f2937' : '#f3f4f6';

  // ------ Compress all embedded images ------
  // Start with decent quality; we'll reduce later if still over limit
  let quality = 0.8;
  let avatarSrc = profile.avatar;
  let imageMap = new Map<string, string>(); // cardId → compressed src

  async function compressAll(q: number) {
    avatarSrc = await compressImage(profile.avatar, 200, q);
    imageMap = new Map();
    for (const card of cards) {
      if (card.type === 'image' && card.imageUrl) {
        imageMap.set(card.id, await compressImage(card.imageUrl, 400, q));
      }
    }
  }

  await compressAll(quality);

  // ------ Build HTML ------
  function buildHtml(): string {
    const cardHtmlParts = cards.map((card) => {
      let inner = '';
      switch (card.type) {
        case 'social':
          inner = socialCardHtml(card, isDark);
          break;
        case 'text':
          inner = textCardHtml(card);
          break;
        case 'image':
          inner = imageCardHtml(card, imageMap.get(card.id) || card.imageUrl || '');
          break;
        case 'link':
          inner = linkCardHtml(card, isDark);
          break;
        case 'map':
          inner = mapCardHtml(card);
          break;
        case 'section-header':
          inner = sectionHeaderHtml(card);
          break;
        default:
          inner = textCardHtml(card);
      }
      const bgStyle = card.bgColor ? `background:${card.bgColor};` : '';
      return `<div class="card" style="${sizeToGrid(card)}${bgStyle}">${inner}</div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(profile.name)} | ReBento</title>
<meta name="description" content="${esc(profile.bio)}">
<meta property="og:title" content="${esc(profile.name)}">
<meta property="og:description" content="${esc(profile.bio)}">
${avatarSrc.startsWith('http') ? `<meta property="og:image" content="${esc(avatarSrc)}">` : ''}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:${bg};color:${textCol};min-height:100vh;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
img{display:block}

.page{max-width:1200px;margin:0 auto;padding:48px 24px 80px;display:grid;grid-template-columns:320px 1fr;gap:48px}
@media(max-width:768px){.page{grid-template-columns:1fr;padding:32px 16px 64px;gap:32px}}

/* Profile */
.profile{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
@media(max-width:768px){.profile{align-items:center;text-align:center}}
.avatar{width:128px;height:128px;border-radius:50%;object-fit:cover;border:4px solid ${isDark ? '#1f2937' : '#fff'};box-shadow:0 4px 12px rgba(0,0,0,.1)}
.name{font-size:1.875rem;font-weight:700;line-height:1.2}
.bio{font-size:1.125rem;line-height:1.6;color:${subText}}
.location{display:flex;align-items:center;gap:8px;color:${subText};font-size:.875rem}
.location svg{width:16px;height:16px;flex-shrink:0}

/* Grid */
.grid-wrap{min-width:0}
.grid-title{font-size:1.125rem;font-weight:600;margin-bottom:24px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;grid-auto-rows:80px;grid-auto-flow:dense}
@media(max-width:768px){.grid{grid-template-columns:repeat(2,1fr)}}

/* Cards */
.card{background:${cardBg};border-radius:16px;border:2px solid ${cardBorder};overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.12)}
.card-inner{display:flex;flex-direction:column;height:100%;width:100%}

/* Social */
.social-card{padding:16px}
.social-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:12px;flex-shrink:0}
.social-icon svg{width:24px;height:24px}
.social-user{font-size:.875rem;font-weight:600;color:${textCol}}
.social-label{font-size:.75rem;color:${subText};margin-top:2px}
.social-btn{display:inline-block;margin-top:auto;padding:8px 16px;border-radius:9999px;font-size:.75rem;font-weight:500;text-align:center;transition:opacity .2s}
.social-btn:hover{opacity:.9}

/* Text */
.text-card{padding:16px;justify-content:center}
.text-card p{font-size:.875rem;color:${subText};line-height:1.5}

/* Image */
.image-card{position:relative}
.image-card img{width:100%;height:100%;object-fit:cover}
.img-caption{position:absolute;bottom:0;left:0;right:0;padding:12px;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;font-size:.875rem;font-weight:500}
.image-empty{display:flex;align-items:center;justify-content:center;height:100%;background:${isDark ? '#1f2937' : '#f3f4f6'}}

/* Link */
.link-card-img{display:flex;flex-direction:column;height:100%}
.link-preview{flex:1;overflow:hidden}
.link-preview img{width:100%;height:100%;object-fit:cover}
.link-bar{display:flex;align-items:center;gap:8px;padding:12px;min-height:44px}
.link-fav{width:16px;height:16px;border-radius:2px;flex-shrink:0}
.link-title{font-size:.75rem;color:${subText};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.link-card-simple{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;gap:12px}
.link-icon-wrap{width:48px;height:48px;border-radius:12px;background:${isDark ? '#1f2937' : '#f3f4f6'};display:flex;align-items:center;justify-content:center}
.link-icon-wrap img{width:24px;height:24px;border-radius:2px}
.link-title-lg{font-size:.875rem;font-weight:500;text-align:center;color:${textCol};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.link-desc{font-size:.75rem;color:${subText};text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* Map */
.map-card{position:relative;height:100%;background:linear-gradient(135deg,${isDark ? '#1e3a5f' : '#dbeafe'},${isDark ? '#1a3347' : '#e0f2fe'})}
.map-bg{position:absolute;inset:0;opacity:.15;background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30h60M30 0v60' stroke='%239ca3af' stroke-width='.5' fill='none'/%3E%3C/svg%3E")}
.map-label{position:absolute;bottom:12px;left:12px;right:12px;background:${isDark ? 'rgba(17,24,39,.95)' : 'rgba(255,255,255,.95)'};backdrop-filter:blur(8px);border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.map-label svg{flex-shrink:0}
.map-label span{font-size:.875rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.map-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:${subText}}

/* Section header */
.section-header{display:flex;align-items:center;height:100%;padding:0 24px;font-size:1.125rem;font-weight:600;color:${isDark ? '#d1d5db' : '#374151'}}

/* Footer */
.footer{text-align:center;margin-top:48px;font-size:.875rem;color:${subText}}
.footer a{color:${accent};font-weight:500}
.footer a:hover{text-decoration:underline}
</style>
</head>
<body>
<div class="page">
  <div class="profile">
    <img class="avatar" src="${esc(avatarSrc)}" alt="${esc(profile.name)}">
    <h1 class="name">${esc(profile.name)}</h1>
    <p class="bio">${esc(profile.bio)}</p>
    ${profile.location ? `<div class="location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg><span>${esc(profile.location)}</span></div>` : ''}
  </div>
  <div class="grid-wrap">
    <div class="grid">
${cardHtmlParts}
    </div>
  </div>
</div>
<div class="footer">Made with <a href="https://rebento_arlink.ar.io" target="_blank">ReBento</a> &mdash; Stored permanently on <a href="https://arweave.org" target="_blank">Arweave</a> &mdash; Powered by <a href="https://arlink.ar.io" target="_blank" style="display:inline-flex;align-items:center;gap:4px"><svg width="14" height="15" viewBox="0 0 137 143" fill="none"><path d="M136.999 43.386C136.667 44.1583 116.715 81.5279 74.3746 65.2046C50.7333 56.0913 32.0456 61.3095 19.1802 68.3754L76.2762 0V43.386H136.999Z" fill="#0C9142"/><path d="M115.045 74.1113L57.9138 143V95.9484H0C4.59367 88.5979 25.7269 60.009 69.441 74.333C89.0365 80.7559 103.987 78.9709 115.045 74.1113Z" fill="#0C9142"/></svg>Arlink</a></div>
</body>
</html>`;
  }

  // ------ Iteratively reduce quality until under 100 KB ------
  let html = buildHtml();
  let sizeBytes = new TextEncoder().encode(html).length;

  // If over limit, try progressively lower quality
  const qualitySteps = [0.6, 0.45, 0.3, 0.2];
  for (const q of qualitySteps) {
    if (sizeBytes <= MAX_SIZE) break;
    await compressAll(q);
    html = buildHtml();
    sizeBytes = new TextEncoder().encode(html).length;
  }

  // Last resort: if still over, reduce image dimensions aggressively
  if (sizeBytes > MAX_SIZE) {
    const shrinkImage = (src: string, dim: number, q: number) =>
      compressImage(src, dim, q);
    avatarSrc = await shrinkImage(profile.avatar, 100, 0.15);
    imageMap = new Map();
    for (const card of cards) {
      if (card.type === 'image' && card.imageUrl) {
        imageMap.set(card.id, await shrinkImage(card.imageUrl, 200, 0.15));
      }
    }
    html = buildHtml();
    sizeBytes = new TextEncoder().encode(html).length;
  }

  return {
    html,
    sizeBytes,
    sizeKB: Math.round((sizeBytes / 1024) * 10) / 10,
    isUnderLimit: sizeBytes <= MAX_SIZE,
  };
}
