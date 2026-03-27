import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
} from "axios";
import type { ApiResponse } from "@/api/api-response";
import { clearSessionAuth, STORAGE_KEYS } from "@/api/storage-keys";
import { toast } from "@/components/ui/sonner";

function formatApiMessage(body: ApiResponse<unknown>): string {
  const parts: string[] = [];
  if (body.error) parts.push(body.error);
  if (body.errors?.length) parts.push(...body.errors);
  return parts.length ? parts.join(" — ") : "Erro desconhecido.";
}

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Ocorreu um erro. Tente novamente.";
  }
  const o = data as Record<string, unknown>;
  if (o.success === false && ("error" in o || "errors" in o)) {
    return formatApiMessage(o as ApiResponse<unknown>);
  }
  if (typeof o.error === "string" && o.error) return o.error;
  if (Array.isArray(o.errors) && o.errors.length) {
    return o.errors.filter((e): e is string => typeof e === "string").join(", ");
  }
  return "Ocorreu um erro. Tente novamente.";
}

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const path = config.url ?? "";
  const isPlatform = path.startsWith("/api/platform/");
  if (!isPlatform) {
    const tenant = localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN);
    if (tenant) {
      config.headers["X-Tenant-Subdomain"] = tenant;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      typeof (payload as ApiResponse<unknown>).success === "boolean"
    ) {
      const apiPayload = payload as ApiResponse<unknown>;
      if (!apiPayload.success) {
        const msg = formatApiMessage(apiPayload);
        toast.error(msg);
        return Promise.reject(new Error(msg));
      }
      (response as AxiosResponse).data = apiPayload.data;
    }
    return response;
  },
  (error: AxiosError<unknown>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    const message = isAxiosError(error)
      ? extractErrorMessage(data) || error.message || "Ocorreu um erro. Tente novamente."
      : "Ocorreu um erro. Tente novamente.";

    toast.error(message);

    if (status === 401) {
      clearSessionAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);

/** Helpers que devolvem diretamente `data` já extraído do envelope */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data as T),

  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, body, config).then((res) => res.data as T),

  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, body, config).then((res) => res.data as T),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data as T),
};
