export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number; factor?: number }
): Promise<T> {
  const { retries, delay, factor = 2 } = options;
  let attempt = 0;
  let currentDelay = delay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt === retries) {
        throw err;
      }
      console.warn(`⚠️ Retry ${attempt}/${retries} after ${currentDelay}ms...`);
      await new Promise((res) => setTimeout(res, currentDelay));
      currentDelay *= factor;
    }
  }

  throw new Error("Max retries exceeded");
}
