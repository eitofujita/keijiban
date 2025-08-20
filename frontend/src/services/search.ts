const API =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"; // フォールバック

export type PostHit = {
  objectID: string;
  title?: string;
  content?: string;
  username?: string;
  communitySlug?: string;
};

export type CommunityHit = {
  objectID: string;
  displayName?: string;
  slug?: string;
  iconUrl?: string;
};

// 直前のリクエスト用コントローラを保持して、次回実行時に中断する
let inflight: AbortController | null = null;

export async function searchAll(
  q: string,
  limit = 10
): Promise<{ posts: PostHit[]; communities: CommunityHit[] }> {
  if (!q.trim()) return { posts: [], communities: [] };

  // 直前のリクエストを中断
  if (inflight) inflight.abort();
  inflight = new AbortController();

  try {
    const url = `${API}/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, { signal: inflight.signal });

    if (!res.ok) throw new Error(`search failed: ${res.status}`);

    const data = (await res.json()) as {
      posts?: PostHit[];
      communities?: CommunityHit[];
    };

    return {
      posts: data.posts ?? [],
      communities: data.communities ?? [],
    };
  } finally {
    inflight = null;
  }
}
