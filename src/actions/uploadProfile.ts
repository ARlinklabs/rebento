import { DataItem } from '@dha-team/arbundles';

const TURBO_UPLOAD_URL = 'https://upload.ardrive.io/v1/tx';
const MAX_FILE_SIZE = 100 * 1024; // 100KB free tier limit

export interface UploadResult {
  success: boolean;
  txId?: string;
  error?: string;
  arweaveUrl?: string;
}

/**
 * Upload HTML content to Arweave via Turbo using Wander wallet for signing
 */
export async function uploadHtmlToArweave(
  html: string,
  username: string
): Promise<UploadResult> {
  try {
    // Ensure wallet is connected
    if (!window.arweaveWallet) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your Wander wallet.',
      };
    }

    // Check permissions
    const permissions = await window.arweaveWallet.getPermissions();
    if (!permissions.includes('SIGN_TRANSACTION')) {
      return {
        success: false,
        error: 'Missing SIGN_TRANSACTION permission. Please reconnect wallet.',
      };
    }

    // Encode HTML to bytes
    const encoder = new TextEncoder();
    const htmlBuffer = encoder.encode(html);

    // Check 100KB free tier limit
    if (htmlBuffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Page exceeds 100KB limit (${(htmlBuffer.length / 1024).toFixed(1)}KB). Reduce content size.`,
      };
    }

    // Get wallet address
    const address = await window.arweaveWallet.getActiveAddress();
    console.log('Uploading from address:', address);

    // Sign the data item using Wander
    const signed = await window.arweaveWallet.signDataItem({
      data: htmlBuffer,
      tags: [
        { name: 'Content-Type', value: 'text/html' },
        { name: 'App-Name', value: 'rebento' },
        { name: 'Type', value: 'profile-page' },
        { name: 'Username', value: username.toLowerCase() },
        { name: 'Version', value: Date.now().toString() },
        { name: 'Owner', value: address },
      ],
    });

    // Create DataItem from signed buffer
    const dataItem = new DataItem(signed);

    console.log('Data item created, ID:', dataItem.id);

    // Upload to Turbo bundler
    const response = await fetch(TURBO_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: dataItem.getRaw(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Turbo upload failed:', response.status, errorText);
      return {
        success: false,
        error: `Upload failed: ${response.status} - ${errorText}`,
      };
    }

    const result = await response.json();
    const txId = result.id || dataItem.id;

    console.log('Upload successful! Transaction ID:', txId);

    return {
      success: true,
      txId,
      arweaveUrl: `https://arweave.net/${txId}`,
    };
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate shareable HTML from the current bento state
 */
export function generateProfileHtml(
  profile: { name: string; bio: string; avatar: string },
  cards: any[],
  theme: { backgroundColor: string; accentColor: string; isDarkMode: boolean }
): string {
  // This is a simplified version - you'd want to generate a complete static HTML
  // that renders the bento grid without React
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.name} | Rebento</title>
  <meta property="og:title" content="${profile.name}">
  <meta property="og:description" content="${profile.bio}">
  <meta property="og:image" content="${profile.avatar}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${theme.backgroundColor};
      color: ${theme.isDarkMode ? '#fff' : '#1a1a1a'};
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .profile { text-align: center; margin-bottom: 2rem; }
    .avatar { width: 100px; height: 100px; border-radius: 50%; margin-bottom: 1rem; }
    .name { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
    .bio { color: #666; }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      grid-auto-rows: 80px;
    }
    .card {
      background: ${theme.isDarkMode ? '#1a1a1a' : '#fff'};
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .card.small { grid-column: span 1; grid-row: span 2; }
    .card.wide { grid-column: span 2; grid-row: span 2; }
    .card.tall { grid-column: span 1; grid-row: span 4; }
    .card.large { grid-column: span 2; grid-row: span 4; }
    .powered-by {
      text-align: center;
      margin-top: 3rem;
      font-size: 0.875rem;
      color: #666;
    }
    .powered-by a { color: ${theme.accentColor}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile">
      <img class="avatar" src="${profile.avatar}" alt="${profile.name}">
      <h1 class="name">${profile.name}</h1>
      <p class="bio">${profile.bio}</p>
    </div>
    <div class="grid">
      ${cards.map(card => `
        <div class="card ${card.size}">
          ${card.type === 'social' ? `<a href="${card.socialUrl}" target="_blank">${card.socialPlatform}</a>` : ''}
          ${card.type === 'link' ? `<a href="${card.linkUrl}" target="_blank">${card.linkTitle || card.linkUrl}</a>` : ''}
          ${card.type === 'text' ? `<p>${card.content || ''}</p>` : ''}
          ${card.type === 'image' && card.imageUrl ? `<img src="${card.imageUrl}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : ''}
        </div>
      `).join('')}
    </div>
    <div class="powered-by">
      Made with <a href="https://rebento.app" target="_blank">Rebento</a> - Stored on Arweave
    </div>
  </div>
</body>
</html>`;

  return html;
}
