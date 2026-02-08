const GQL_ENDPOINT = 'https://arweave.net/graphql';

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

/**
 * Query Arweave for the latest deployed ReBento profile page by username.
 * Returns the HTML content of the most recent version.
 */
export async function fetchProfileFromArweave(
  username: string
): Promise<FetchProfileResult> {
  try {
    const normalised = username.toLowerCase().replace(/^@/, '');

    // 1. GQL query to find matching transactions
    const gqlRes = await fetch(GQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { username: normalised },
      }),
    });

    if (!gqlRes.ok) {
      return { success: false, error: `GraphQL request failed: ${gqlRes.status}` };
    }

    const gqlData = await gqlRes.json();
    const edges: Array<{
      node: { id: string; tags: Array<{ name: string; value: string }> };
    }> = gqlData?.data?.transactions?.edges ?? [];

    if (edges.length === 0) {
      return { success: false, error: 'Profile not found' };
    }

    // 2. Pick the edge with the highest Version tag (most recent deployment)
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

    const txId = best.node.id;
    const ownerTag = best.node.tags.find((t) => t.name === 'Owner');
    const owner = ownerTag?.value;

    // 3. Fetch the actual HTML content from Arweave
    const htmlRes = await fetch(`https://arweave.net/${txId}`);

    if (!htmlRes.ok) {
      return { success: false, error: `Failed to fetch page content: ${htmlRes.status}` };
    }

    const html = await htmlRes.text();

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
