export function normalizeRoute(url: string) {
    try {
      const u = new URL(url);
      return u.pathname.replace(/\d+/g, ":id"); // naive param normalization
    } catch {
      return url;
    }
  }
  