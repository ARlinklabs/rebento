import { createData, ArweaveSigner } from '@dha-team/arbundles';
import Arweave from 'arweave';

const MAX_FILE_SIZE = 100 * 1024; // 100KB free tier limit
const TURBO_UPLOAD_URL = 'https://upload.ardrive.io/v1/tx';

const arweave = new Arweave({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

export interface UploadResult {
  success: boolean;
  txId?: string;
  dataCaches?: string[];
  fastFinalityIndexes?: string[];
  error?: string;
  arweaveUrl?: string;
}

/**
 * Upload HTML content to Arweave via Turbo (direct HTTP upload with arbundles signing).
 * Generates a throwaway wallet for signing — ownership is tracked via the Owner tag.
 */
export async function uploadHtmlToArweave(
  html: string,
  username: string,
  walletAddress: string
): Promise<UploadResult> {
  try {
    const encoder = new TextEncoder();
    const htmlBuffer = encoder.encode(html);

    if (htmlBuffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Page exceeds 100KB limit (${(htmlBuffer.length / 1024).toFixed(1)}KB). Reduce content size.`,
      };
    }

    if (!walletAddress) {
      return { success: false, error: 'No wallet address. Please sign in first.' };
    }

    console.log('[uploadProfile] walletAddress:', walletAddress);
    console.log('[uploadProfile] html size:', htmlBuffer.length, 'bytes');
    console.log('[uploadProfile] username:', username);

    // Generate a throwaway wallet and signer
    const wallet = await arweave.wallets.generate();
    const signer = new ArweaveSigner(wallet);

    // Create and sign data item using arbundles
    const dataItem = createData(html, signer, {
      tags: [
        { name: 'Content-Type', value: 'text/html' },
        { name: 'App-Name', value: 'rebento' },
        { name: 'Type', value: 'profile-page' },
        { name: 'Username', value: username.toLowerCase().replace(/[^a-z0-9._-]/g, '') },
        { name: 'Version', value: Date.now().toString() },
        { name: 'Owner', value: walletAddress },
      ],
    });

    await dataItem.sign(signer);

    console.log('[uploadProfile] signed dataItem id:', dataItem.id);

    // POST signed data item directly to Turbo's upload endpoint
    const res = await fetch(TURBO_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Uint8Array(dataItem.getRaw()),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Turbo upload failed (${res.status}): ${errText}` };
    }

    const result = await res.json();

    console.log('[uploadProfile] turbo response:', result);
    console.log('[uploadProfile] txId:', result.id);
    console.log('[uploadProfile] dataCaches:', result.dataCaches);
    console.log('[uploadProfile] fastFinalityIndexes:', result.fastFinalityIndexes);

    const txId = result.id;

    if (!txId) {
      return {
        success: false,
        error: 'Upload succeeded but no transaction ID returned.',
      };
    }

    return {
      success: true,
      txId,
      dataCaches: result.dataCaches,
      fastFinalityIndexes: result.fastFinalityIndexes,
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
