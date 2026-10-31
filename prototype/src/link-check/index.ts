// MOD-link-check, reduced to what MOD-catalogue needs: whether a model's link answers.
export async function checkLink({ url }: { url: string }): Promise<{ reachable: boolean }> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return { reachable: res.ok };
  } catch {
    return { reachable: false };
  }
}
