import { getCache, setCache } from './cache';

const REGION_LIST_KEY = 'region_list';
const REGION_DETAIL_PREFIX = 'region_detail_';

export interface RegionMetadata {
  id: string;
  name: string;
  thumbnailUrl: string;
  hasHighRes: boolean;
}

export interface RegionDetail {
  id: string;
  name: string;
  description: string;
  highResUrl: string;
  audioGuideUrl: string;
  lastUpdated: string;
}

/**
 * Fetch the list of all regions (low-res metadata).
 * First check cache; otherwise fetch from API and cache the result.
 * On network error, return an empty array.
 */
export async function fetchAllRegions(): Promise<RegionMetadata[]> {
  // 1) Try cache first
  const cached = await getCache<RegionMetadata[]>(REGION_LIST_KEY);
  if (cached) {
    return cached;
  }

  // 2) Attempt network fetch
  try {
    const response = await fetch('https://api.aurora-baby.com/regions');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as RegionMetadata[];
    await setCache(REGION_LIST_KEY, data);
    return data;
  } catch (err) {
    console.warn('fetchAllRegions failed:', err);
    // Best we can do: cache an empty array so we don’t keep retrying every launch
    await setCache(REGION_LIST_KEY, []);
    return [];
  }
}

/**
 * Fetch full region details (high-res).
 * Check cache first; otherwise fetch and cache.
 * On network error, return null (caller should handle).
 */
export async function fetchRegionDetail(id: string): Promise<RegionDetail | null> {
  const cacheKey = REGION_DETAIL_PREFIX + id;

  // 1) Check cache
  const cached = await getCache<RegionDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2) Attempt network fetch
  try {
    const response = await fetch(`https://api.aurora-baby.com/regions/${id}/detail`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as RegionDetail;
    await setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`fetchRegionDetail(${id}) failed:`, err);
    return null;
  }
}
