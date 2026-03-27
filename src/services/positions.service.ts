import type { CreatePositionPayload, Position, UpdatePositionPayload } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listPositions(): Promise<Position[]> {
  return api.get<Position[]>("/api/positions");
}

export async function getPosition(id: string): Promise<Position> {
  return api.get<Position>(`/api/positions/${id}`);
}

export async function createPosition(payload: CreatePositionPayload): Promise<Position> {
  return api.post<Position>("/api/positions", payload);
}

export async function updatePosition(id: string, payload: UpdatePositionPayload): Promise<Position> {
  return api.put<Position>(`/api/positions/${id}`, payload);
}

export async function deletePosition(id: string): Promise<null> {
  return api.delete<null>(`/api/positions/${id}`, { skipErrorToast: true });
}
