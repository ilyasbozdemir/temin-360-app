// TEMİN 360 Unified Web & Database API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  count?: number;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "dta_live_8e4a90f1b2c3d4e59071f",
        ...options.headers,
      },
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error(`API Fetch Error [${url}]:`, error);
    return {
      success: false,
      error: error.message || "Sunucuya bağlanılamadı.",
    };
  }
}

// Dosyalar CRUD
export const DosyalarApi = {
  list: (params?: { q?: string; yil?: string; durum?: string; alimTuru?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.yil) query.set("yil", params.yil);
    if (params?.durum) query.set("durum", params.durum);
    if (params?.alimTuru) query.set("alimTuru", params.alimTuru);
    const queryString = query.toString();
    return fetchApi<any[]>(`/dosyalar${queryString ? `?${queryString}` : ""}`);
  },

  get: (id: number) => fetchApi<any>(`/dosyalar/${id}`),

  create: (data: any) =>
    fetchApi<any>("/dosyalar", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    fetchApi<any>(`/dosyalar/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<any>(`/dosyalar/${id}`, {
      method: "DELETE",
    }),
};

// Kalemler CRUD
export const KalemlerApi = {
  listByDosya: (dosyaId: number) => fetchApi<any[]>(`/kalemler?dosyaId=${dosyaId}`),

  create: (data: any) =>
    fetchApi<any>("/kalemler", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    fetchApi<any>(`/kalemler/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<any>(`/kalemler/${id}`, {
      method: "DELETE",
    }),
};

// Firmalar CRUD
export const FirmalarApi = {
  list: (q?: string) => fetchApi<any[]>(`/firmalar${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  create: (data: any) =>
    fetchApi<any>("/firmalar", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    fetchApi<any>(`/firmalar/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<any>(`/firmalar/${id}`, {
      method: "DELETE",
    }),
};

// Kurum & Sistem
export const SystemApi = {
  getHealth: () => fetchApi<any>("/health"),
  getStats: () => fetchApi<any>("/stats"),
  getKurum: () => fetchApi<any>("/kurum"),
};
