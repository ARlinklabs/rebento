/**
 * AO Cache — Shared decentralized username→txId cache on HyperBEAM.
 *
 * ONE shared process stores all username→txId mappings.
 *
 * Architecture:
 *   Write: CacheSet handler — signed via arlinkauth (user's connected wallet)
 *   Read:  CacheGet handler + outbox chain — throwaway wallet (viewer may not be logged in)
 */

import { createData, ArweaveSigner } from '@dha-team/arbundles';
import Arweave from 'arweave';

// ── Shared process config ──
const HB_URL = 'https://push.forward.computer';
const CACHE_PID = 'wwFVJeGWw4vH-1mrzzl_rdR2vpKr36N_yD1pEJBaTIk';

const arweave = new Arweave({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

// ── Types ──

interface CacheEntry {
  txId: string;
  owner: string;
  version: number;
}

/** Anything that can sign ANS-104 data items (arlinkauth client satisfies this). */
export interface DataItemSigner {
  signDataItem(input: {
    data: string;
    tags?: Array<{ name: string; value: string }>;
    target?: string;
  }): Promise<{ id: string; raw: number[] }>;
}

// ── Read-only signer (throwaway wallet for unauthenticated viewers) ──

let _readSigner: ArweaveSigner | null = null;
let _readSignerPromise: Promise<ArweaveSigner> | null = null;

async function getReadSigner(): Promise<ArweaveSigner> {
  if (_readSigner) return _readSigner;
  if (!_readSignerPromise) {
    _readSignerPromise = arweave.wallets.generate().then((jwk) => {
      _readSigner = new ArweaveSigner(jwk);
      return _readSigner;
    });
  }
  return _readSignerPromise;
}

// ── Low-level helpers ──

/** POST a pre-signed ANS-104 data item to HyperBEAM. */
async function postRaw(
  raw: Uint8Array
): Promise<{ status: number; body: string; slot: string | null }> {
  const response = await fetch(
    `${HB_URL}/${CACHE_PID}~process@1.0/push`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ans104',
        'codec-device': 'ans104@1.0',
      },
      body: raw as unknown as BodyInit,
    }
  );

  return {
    status: response.status,
    body: await response.text(),
    slot: response.headers.get('slot'),
  };
}

/** Sign + POST using arbundles (for reads with throwaway wallet). */
async function pushWithArbundles(
  tags: Array<{ name: string; value: string }>,
  signer: ArweaveSigner
): Promise<{ status: number; body: string; slot: string | null }> {
  const dataItem = createData('', signer, { tags, target: CACHE_PID });
  await dataItem.sign(signer);
  return postRaw(new Uint8Array(dataItem.getRaw()));
}

/**
 * Read the outbox of a handler execution at a given slot.
 * Chain: compute={slot} → results+link → outbox+link → 1+link → message
 */
async function readOutbox(
  slot: string
): Promise<Record<string, string> | null> {
  try {
    const compute = await fetch(
      `${HB_URL}/${CACHE_PID}~process@1.0/compute=${slot}`,
      { headers: { accept: 'application/json' } }
    ).then((r) => r.json());

    const results = await fetch(`${HB_URL}/${compute['results+link']}`, {
      headers: { accept: 'application/json' },
    }).then((r) => r.json());

    const outbox = await fetch(`${HB_URL}/${results['outbox+link']}`, {
      headers: { accept: 'application/json' },
    }).then((r) => r.json());

    for (const [k, v] of Object.entries(outbox)) {
      if (/^\d+\+link$/.test(k)) {
        const msg = await fetch(`${HB_URL}/${v}`, {
          headers: { accept: 'application/json' },
        }).then((r) => r.json());
        return msg as Record<string, string>;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ── Public API ──

/**
 * Cache a username→txId mapping after upload.
 * Uses arlinkauth's connected wallet to sign the message.
 */
export async function cacheSet(
  username: string,
  txId: string,
  owner: string,
  signer: DataItemSigner
): Promise<boolean> {
  try {
    const normalised = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');

    // AOS title-cases tag names: "Cacheset" not "CacheSet", "Txid" not "TxId"
    const { raw } = await signer.signDataItem({
      data: '',
      tags: [
        { name: 'Action', value: 'Cacheset' },
        { name: 'Username', value: normalised },
        { name: 'Txid', value: txId },
        { name: 'Owner', value: owner },
        { name: 'Version', value: Date.now().toString() },
        { name: 'Type', value: 'Message' },
        { name: 'Data-Protocol', value: 'ao' },
        { name: 'Variant', value: 'ao.N.1' },
      ],
      target: CACHE_PID,
    });

    const result = await postRaw(new Uint8Array(raw));

    if (result.status === 200) {
      console.log('[aoCache] cached:', normalised, '→', txId);
      return true;
    }

    console.warn('[aoCache] set unexpected:', result.status, result.body);
    return false;
  } catch (err) {
    console.warn('[aoCache] set failed:', err);
    return false;
  }
}

/**
 * Look up a cached txId by username.
 * Uses throwaway wallet (viewer may not be logged in).
 * Returns null on miss — caller should fall back to GraphQL.
 */
export async function cacheGet(
  username: string
): Promise<CacheEntry | null> {
  try {
    const signer = await getReadSigner();
    const normalised = username
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9._-]/g, '');

    const result = await pushWithArbundles(
      [
        { name: 'Action', value: 'Cacheget' },
        { name: 'Username', value: normalised },
        { name: 'Type', value: 'Message' },
        { name: 'Data-Protocol', value: 'ao' },
        { name: 'Variant', value: 'ao.N.1' },
      ],
      signer
    );

    if (result.status !== 200 || !result.slot) {
      return null;
    }

    const msg = await readOutbox(result.slot);
    if (!msg || msg.Data === 'MISS' || !msg.Txid) {
      return null;
    }

    return {
      txId: msg.Txid,
      owner: msg.Owner || '',
      version: msg.Version ? parseInt(msg.Version, 10) : 0,
    };
  } catch (err) {
    console.warn('[aoCache] get failed:', err);
    return null;
  }
}

/**
 * Pre-generate throwaway read signer so it's ready for profile lookups.
 */
export async function cacheWarmup(): Promise<void> {
  try {
    await getReadSigner();
  } catch (err) {
    console.warn('[aoCache] warmup failed:', err);
  }
}
