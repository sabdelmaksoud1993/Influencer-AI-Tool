import * as SecureStore from 'expo-secure-store';

const CACHE_PREFIX = 'glowpass_cache_';

export async function cacheData(key: string, data: unknown): Promise<void> {
  try {
    const cacheEntry = {
      data,
      cachedAt: Date.now(),
    };
    await SecureStore.setItemAsync(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(cacheEntry)
    );
  } catch {
    // SecureStore has size limits, silently fail
  }
}

export async function getCachedData<T>(
  key: string,
  maxAgeMs: number = 30 * 60 * 1000 // 30 minutes default
): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    const age = Date.now() - entry.cachedAt;

    if (age > maxAgeMs) return null; // Expired

    return entry.data as T;
  } catch {
    return null;
  }
}

export async function clearCache(): Promise<void> {
  // SecureStore doesn't support listing keys, so we clear known ones
  const keys = ['events', 'members', 'venues', 'applications', 'stats'];
  for (const key of keys) {
    try {
      await SecureStore.deleteItemAsync(`${CACHE_PREFIX}${key}`);
    } catch {
      // ignore
    }
  }
}
