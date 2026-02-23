"use server";

import {
  getCountriesGrpc,
  getRegionsGrpc,
  getCitiesGrpc,
} from "@/lib/grpc-client";

// In-memory caches — persist across requests in the same server process
let countriesCache: any[] | null = null;
const regionsCache = new Map<string, any[]>();
const citiesCache = new Map<number, any[]>();

export async function fetchCountries() {
  if (countriesCache) return countriesCache;
  try {
    const response = await getCountriesGrpc();
    countriesCache = (response.data || []).map((c: any) => ({
      id: c.id,
      iso2: c.iso2,
      name: c.name,
    }));
    return countriesCache;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

export async function fetchRegions(iso2Code: string) {
  if (regionsCache.has(iso2Code)) return regionsCache.get(iso2Code)!;
  try {
    const response = await getRegionsGrpc(iso2Code);
    const data = (response.data || []).map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
    }));
    regionsCache.set(iso2Code, data);
    return data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
}

export async function fetchCities(regionId: number) {
  if (citiesCache.has(regionId)) return citiesCache.get(regionId)!;
  try {
    const response = await getCitiesGrpc(regionId);
    const data = (response.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
    citiesCache.set(regionId, data);
    return data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

