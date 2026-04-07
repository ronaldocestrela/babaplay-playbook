/** Envelope padrão da API (ver docs/backend/api-conventions.md) */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  errors: string[] | null;
}

/** Resposta de auth (register/login) */
export interface AuthData {
  accessToken: string;
  userId: string;
  roles: string[];
  permissions: string[];
}

export type UserType = 0 | 1 | 2;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  userType?: UserType;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  databaseName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTenantPayload {
  name: string;
  subdomain: string;
}

export interface SubscriptionPayload {
  planId: string;
}

export type SubscriptionStatus = 0 | 1 | 2;

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  maxAssociates: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePlanPayload {
  name: string;
  description: string | null;
  monthlyPrice: number;
  maxAssociates: number | null;
}

export interface Position {
  id: string;
  name: string;
  /** Presente na API de associados; opcional para compatibilidade com respostas antigas */
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePositionPayload {
  name: string;
}

/** Mesmo formato da criação (PUT /api/positions/:id) */
export type UpdatePositionPayload = CreatePositionPayload;

/** Posição projetada no DTO de associado (GET /api/associates); sem entidades EF aninhadas. */
export interface AssociatePositionItem {
  positionId: string;
  positionName: string;
}

export interface Associate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  userId: string | null;
  /** Associados inativos não podem fazer login (ver auth-controller). */
  isActive: boolean;
  positions: AssociatePositionItem[];
  createdAt: string;
  updatedAt: string | null;
}

/** POST/PUT /api/associates — e-mail obrigatório (único no tenant); o servidor provisiona utilizador Identity. */
export interface CreateAssociatePayload {
  name: string;
  email: string;
  phone: string | null;
  positionIds: string[];
}

/** Mesmo formato da criação (PUT /api/associates/:id) */
export type UpdateAssociatePayload = CreateAssociatePayload;

/** PATCH /api/associates/:id/active */
export interface UpdateAssociateActivePayload {
  isActive: boolean;
}

/** POST /api/associates/invitations (Admin ou Manager) */
export interface CreateAssociateInvitationPayload {
  email?: string;
  isSingleUse?: boolean;
}

/** Resposta de POST /api/associates/invitations */
export interface AssociateInvitationCreated {
  token: string;
  email: string | null;
  isSingleUse: boolean;
  expiresAt: string;
  link: string;
}

/** GET /api/associates/invitations/{token} (sem campo link) */
export interface AssociateInvitationValidation {
  token: string;
  email: string | null;
  isSingleUse: boolean;
  expiresAt: string;
}

export interface Association {
  id: string;
  name: string;
  address: string | null;
  regulation: string | null;
  playersPerTeam: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertAssociationPayload {
  id?: string | null;
  name: string;
  address: string | null;
  regulation: string | null;
  playersPerTeam?: number;
}

export interface CheckInSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CheckIn {
  id: string;
  sessionId: string;
  associateId: string;
  checkedInAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCheckInPayload {
  sessionId: string;
  associateId: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  associateId: string;
  order: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface Team {
  id: string;
  sessionId: string;
  name: string;
  /** Presente em GET by-session; pode estar ausente logo após generate */
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string | null;
}

export interface GenerateTeamsPayload {
  sessionId: string;
}

export type MembershipStatus = 0 | 1 | 2;

export interface Membership {
  id: string;
  associateId: string;
  year: number;
  month: number;
  amount: number;
  status: MembershipStatus;
  payments: unknown[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateMembershipPayload {
  associateId: string;
  year: number;
  month: number;
  amount: number;
}

export interface MembershipPaymentPayload {
  amount: number;
  method: string;
}

export interface MembershipPayment {
  id: string;
  membershipId: string;
  paidAt: string;
  amount: number;
  method: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: 0 | 1;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  type: 0 | 1;
}

export interface CashEntry {
  id: string;
  amount: number;
  currentBalance: number;
  categoryId: string;
  description: string | null;
  entryDate: string;
  category: Category;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCashEntryPayload {
  amount: number;
  categoryId: string;
  description: string | null;
  entryDate?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}
