import type { AuthData, LoginPayload, RegisterPayload } from "@/api/api-response";
import { readJsonStorage, STORAGE_KEYS, clearSessionAuth, clearAuthStorage } from "@/api/storage-keys";
import * as authService from "@/services/auth.service";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthContextValue = {
  token: string | null;
  userId: string | null;
  roles: string[];
  permissions: string[];
  tenantSubdomain: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  /** Define o tenant para `X-Tenant-Subdomain` (obrigatório antes de login/register no tenant). */
  setTenantSubdomain: (subdomain: string | null) => void;
  /** Limpa sessão e tenant (ex.: sair completamente). */
  logoutAll: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialState() {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const roles = readJsonStorage<string[]>(STORAGE_KEYS.ROLES, []);
  const permissions = readJsonStorage<string[]>(STORAGE_KEYS.PERMISSIONS, []);
  const tenantSubdomain = localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN);
  return {
    token,
    userId,
    roles,
    permissions,
    tenantSubdomain,
    isAuthenticated: Boolean(token),
  };
}

function persistAuthData(data: AuthData) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId);
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(data.roles));
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(data.permissions));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readInitialState);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    persistAuthData(data);
    setState({
      token: data.accessToken,
      userId: data.userId,
      roles: data.roles,
      permissions: data.permissions,
      tenantSubdomain: localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN),
      isAuthenticated: true,
    });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await authService.register(payload);
    persistAuthData(data);
    setState({
      token: data.accessToken,
      userId: data.userId,
      roles: data.roles,
      permissions: data.permissions,
      tenantSubdomain: localStorage.getItem(STORAGE_KEYS.TENANT_SUBDOMAIN),
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearSessionAuth();
    setState((prev) => ({
      ...prev,
      token: null,
      userId: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
    }));
  }, []);

  const logoutAll = useCallback(() => {
    clearAuthStorage();
    setState({
      token: null,
      userId: null,
      roles: [],
      permissions: [],
      tenantSubdomain: null,
      isAuthenticated: false,
    });
  }, []);

  const setTenantSubdomain = useCallback((subdomain: string | null) => {
    if (subdomain) {
      localStorage.setItem(STORAGE_KEYS.TENANT_SUBDOMAIN, subdomain);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TENANT_SUBDOMAIN);
    }
    setState((prev) => ({ ...prev, tenantSubdomain: subdomain }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      userId: state.userId,
      roles: state.roles,
      permissions: state.permissions,
      tenantSubdomain: state.tenantSubdomain,
      isAuthenticated: state.isAuthenticated,
      login,
      register,
      logout,
      logoutAll,
      setTenantSubdomain,
    }),
    [
      state.token,
      state.userId,
      state.roles,
      state.permissions,
      state.tenantSubdomain,
      state.isAuthenticated,
      login,
      register,
      logout,
      logoutAll,
      setTenantSubdomain,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}
