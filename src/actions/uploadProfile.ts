const MAX_FILE_SIZE = 100 * 1024; // 100KB free tier limit

export interface UploadResult {
  success: boolean;
  txId?: string;
  error?: string;
  arweaveUrl?: string;
}

/**
 * Upload HTML content to Arweave via arlinkauth's dispatch (Turbo bundler).
 * Takes the arlinkauth client + wallet address directly (from useAuth context).
 */
export async function uploadHtmlToArweave(
  html: string,
  username: string,
  client: { dispatch: (opts: any) => Promise<any> },
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
    console.log('[uploadProfile] client:', client);
    console.log('[uploadProfile] client.dispatch:', typeof client.dispatch);

    const dispatchOpts = {
      data: html,
      tags: [
        { name: 'Content-Type', value: 'text/html' },
        { name: 'App-Name', value: 'rebento' },
        { name: 'Type', value: 'profile-page' },
        { name: 'Username', value: username.toLowerCase().replace(/[^\x21-\x7e]/g, '') },
        { name: 'Version', value: Date.now().toString() },
        { name: 'Owner', value: walletAddress },
      ],
      bundler: 'turbo',
    };
    console.log('[uploadProfile] dispatch opts (without data):', { ...dispatchOpts, data: `<${htmlBuffer.length} bytes>` });

    const result = await client.dispatch(dispatchOpts);

    console.log('[uploadProfile] dispatch result:', result);
    console.log('[uploadProfile] result keys:', Object.keys(result || {}));
    console.log('[uploadProfile] result.bundlerId:', result?.bundlerId);
    console.log('[uploadProfile] result.id:', result?.id);
    console.log('[uploadProfile] result.txId:', result?.txId);

    const txId = result.bundlerId || result.id || result.txId;

    if (!txId) {
      return { success: false, error: 'Upload succeeded but no transaction ID returned. Result: ' + JSON.stringify(result) };
    }

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
