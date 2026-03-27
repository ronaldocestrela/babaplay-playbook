import type {
  CreateMembershipPayload,
  Membership,
  MembershipPayment,
  MembershipPaymentPayload,
} from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listMembershipsByAssociate(associateId: string): Promise<Membership[]> {
  return api.get<Membership[]>(`/api/memberships/associate/${associateId}`);
}

export async function createMembership(payload: CreateMembershipPayload): Promise<Membership> {
  return api.post<Membership>("/api/memberships", payload);
}

export async function addMembershipPayment(
  membershipId: string,
  payload: MembershipPaymentPayload,
): Promise<MembershipPayment> {
  return api.post<MembershipPayment>(`/api/memberships/${membershipId}/payments`, payload);
}
