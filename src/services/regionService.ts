// src/services/regionService.ts

import { getCache, setCache } from './cache';

const REGION_LIST_KEY = 'region_list';
const REGION_DETAIL_PREFIX = 'region_detail_';

export interface RegionMetadata {
  id: string;
  name: string;
  thumbnailUrl: string;
  hasHighRes: boolean;
}

/**
 * Fetch the list of all regions (low-res metadata).
 * First check cache; otherwise fetch from API and cache the result.
 */
export async function fetchAllRegions(): Promise<RegionMetadata[]> {
  // Attempt to read from cache
  const cached = await getCache<RegionMetadata[]>(REGION_LIST_KEY);
  if (cached) {
    return cached;
  }

  // Otherwise, fetch from the server
  const response = await fetch('https://api.aurora-baby.com/regions'); // adjust endpoint
  if (!response.ok) {
    throw new Error('Failed to fetch region list');
  }
  const data = (await response.json()) as RegionMetadata[];
  await setCache(REGION_LIST_KEY, data);
  return data;
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
 * Fetch full region details (high-res).
 * Check cache first; otherwise fetch and cache.
 */
export async function fetchRegionDetail(id: string): Promise<RegionDetail> {
  const cacheKey = REGION_DETAIL_PREFIX + id;
  // Check cache
  const cached = await getCache<RegionDetail>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from server
  const response = await fetch(`https://api.aurora-baby.com/regions/${id}/detail`);
  if (!response.ok) {
    throw new Error(`Failed to fetch detail for region ${id}`);
  }
  const data = (await response.json()) as RegionDetail;
  await setCache(cacheKey, data);
  return data;
}
