/**
 * NutriTrack Jatim - API Client untuk terhubung ke Backend Express (Port 5000)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 1. Smart KMS Digital APIs
export const kmsApi = {
  calculateZScore: (data: {
    ageMonths: number;
    gender: "L" | "P";
    weightKg: number;
    heightCm: number;
    previousWeightKg?: number;
  }) => apiRequest("/api/growth-records/calculate", { method: "POST", body: JSON.stringify(data) }),

  saveGrowthRecord: (data: any) =>
    apiRequest("/api/growth-records", { method: "POST", body: JSON.stringify(data) }),

  syncOfflineRecords: (items: any[]) =>
    apiRequest("/api/growth-records/sync", { method: "POST", body: JSON.stringify({ items }) }),

  getChildren: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiRequest(`/api/children${query}`);
  },

  getChildById: (id: string) => apiRequest(`/api/children/${id}`),
};

// 2. Menu MBG Komoditas Jatim APIs
export const recipeApi = {
  getAll: (kategori?: string) => {
    const query = kategori ? `?kategori=${encodeURIComponent(kategori)}` : "";
    return apiRequest(`/api/recipes${query}`);
  },
  getById: (id: string) => apiRequest(`/api/recipes/${id}`),
};

// 3. Dasbor Dapur & Kalkulator Belanja Lokal APIs
export const kitchenApi = {
  getSummary: (kabupaten?: string, kecamatan?: string) => {
    const params = new URLSearchParams();
    if (kabupaten) params.append("kabupaten", kabupaten);
    if (kecamatan) params.append("kecamatan", kecamatan);
    return apiRequest(`/api/kitchen/summary?${params.toString()}`);
  },

  calculateProcurement: (portionA: number, portionB: number) =>
    apiRequest("/api/kitchen/procurement-calculator", {
      method: "POST",
      body: JSON.stringify({ portionA, portionB }),
    }),

  getSupplyLogs: () => apiRequest("/api/kitchen/supply-logs"),
};

// 4. Distribusi & Scan QR APIs
export const distributionApi = {
  getAll: () => apiRequest("/api/distributions"),
  getByToken: (token: string) => apiRequest(`/api/distributions/token/${token}`),
  verifyConsumption: (token: string, dayaTerima: string, verifiedBy?: string) =>
    apiRequest(`/api/distributions/token/${token}/verify-consumption`, {
      method: "POST",
      body: JSON.stringify({ dayaTerima, verifiedBy }),
    }),
};

// 5. Analitik & Heatmap Jatim APIs
export const analyticsApi = {
  getRegions: () => apiRequest("/api/analytics/regions"),
  getRonCohort: () => apiRequest("/api/analytics/ron-cohort"),
  getKpis: () => apiRequest("/api/analytics/kpis"),
  exportAuditReport: (format: "json" | "csv" = "json") =>
    apiRequest(`/api/reports/export?format=${format}`),
};
