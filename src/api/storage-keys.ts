export const STORAGE_KEYS = {
  ACCESS_TOKEN: "babaplay_access_token",
  USER_ID: "babaplay_user_id",
  ROLES: "babaplay_roles",
  PERMISSIONS: "babaplay_permissions",
  TENANT_SUBDOMAIN: "babaplay_tenant_subdomain",
} as const;

export function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Remove apenas credenciais (mantém subdomínio do tenant para novo login). */
export function clearSessionAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.ROLES);
  localStorage.removeItem(STORAGE_KEYS.PERMISSIONS);
}

/** Limpa tudo incluindo tenant (ex.: troca de clube). */
export function clearAuthStorage(): void {
  clearSessionAuth();
  localStorage.removeItem(STORAGE_KEYS.TENANT_SUBDOMAIN);
}
