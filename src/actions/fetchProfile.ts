import { cacheGet } from '@/lib/aoCache';

// arweave.net is first — Turbo SDK uploads get fast finality indexing there.
const GATEWAYS = [
  'https://arweave.net',
  'https://arweave.developerdao.com',
  'https://g8way.io',
];

export interface FetchProfileResult {
  success: boolean;
  html?: string;
  txId?: string;
  owner?: string;
  username?: string;
  version?: string;
  error?: string;
}

const QUERY = `
query FetchProfile($username: String!) {
  transactions(
    tags: [
      { name: "App-Name", values: ["rebento"] }
      { name: "Type", values: ["profile-page"] }
      { name: "Username", values: [$username] }
    ]
    sort: HEIGHT_DESC
    first: 5
  ) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}`;

type Edge = {
  node: { id: string; tags: Array<{ name: string; value: string }> };
};

/** Try a single gateway's GQL endpoint. Returns edges or null. */
async function queryGateway(
  gateway: string,
  normalised: string
): Promise<Edge[] | null> {
  try {
    const res = await fetch(`${gateway}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: normalised },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const edges: Edge[] = data?.data?.transactions?.edges ?? [];
    return edges.length > 0 ? edges : null;
  } catch {
    return null;
  }
}

/** Try fetching HTML content from gateways in order. */
async function fetchHtmlFromGateways(txId: string): Promise<string | null> {
  for (const gw of GATEWAYS) {
    try {
      const res = await fetch(`${gw}/${txId}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 0) return text;
      }
    } catch {
      // try next
    }
  }
  return null;
}

/**
 * Pick the edge with the highest Version tag (most recent deployment).
 */
function pickBestEdge(edges: Edge[]) {
  let best = edges[0];
  let bestVersion = 0;
  for (const edge of edges) {
    const versionTag = edge.node.tags.find((t) => t.name === 'Version');
    const v = versionTag ? parseInt(versionTag.value, 10) : 0;
    if (v > bestVersion) {
      bestVersion = v;
      best = edge;
    }
  }
  return { best, bestVersion };
}

/**
 * Query Arweave for the latest deployed ReBento profile page by username.
 *
 * Two-tier lookup:
 *   1. Fast: AO cache on HyperBEAM (~2s) — decentralized, instant after upload
 *   2. Slow: GraphQL across gateways (~17min delay) — fully decentralized fallback
 */
export async function fetchProfileFromArweave(
  username: string
): Promise<FetchProfileResult> {
  try {
    const normalised = username.toLowerCase().replace(/^@/, '');

    // ── Tier 1: AO cache (fast path) ──
    try {
      const cached = await cacheGet(normalised);
      if (cached?.txId) {
        console.log('[fetchProfile] cache hit:', normalised, '→', cached.txId);
        const html = await fetchHtmlFromGateways(cached.txId);
        if (html) {
          return {
            success: true,
            html,
            txId: cached.txId,
            owner: cached.owner,
            username: normalised,
            version: cached.version ? new Date(cached.version).toISOString() : undefined,
          };
        }
        // Cache had txId but HTML not available yet — fall through to GraphQL
        console.log('[fetchProfile] cache hit but HTML not available, falling back to GraphQL');
      }
    } catch (err) {
      console.warn('[fetchProfile] cache lookup failed, falling back to GraphQL:', err);
    }

    // ── Tier 2: GraphQL (slow path, fully decentralized) ──

    // 1. Query all gateways in parallel, use first one that returns results
    const results = await Promise.all(
      GATEWAYS.map((gw) => queryGateway(gw, normalised))
    );

    // Merge all edges from all gateways, dedupe by txId, pick best version
    const allEdges = new Map<string, Edge>();
    for (const edges of results) {
      if (!edges) continue;
      for (const edge of edges) {
        allEdges.set(edge.node.id, edge);
      }
    }

    if (allEdges.size === 0) {
      return { success: false, error: 'Profile not found' };
    }

    const { best, bestVersion } = pickBestEdge([...allEdges.values()]);

    const txId = best.node.id;
    const ownerTag = best.node.tags.find((t) => t.name === 'Owner');
    const owner = ownerTag?.value;

    // 2. Fetch actual HTML, trying gateways in order
    const html = await fetchHtmlFromGateways(txId);

    if (!html) {
      return { success: false, error: 'Found profile but could not fetch page content from any gateway.' };
    }

    return {
      success: true,
      html,
      txId,
      owner,
      username: normalised,
      version: bestVersion ? new Date(bestVersion).toISOString() : undefined,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
