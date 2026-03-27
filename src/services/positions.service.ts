import type { CreatePositionPayload, Position } from "@/api/api-response";
import { api } from "@/api/axios-instance";

export async function listPositions(): Promise<Position[]> {
  return api.get<Position[]>("/api/positions");
}

export async function createPosition(payload: CreatePositionPayload): Promise<Position> {
  return api.post<Position>("/api/positions", payload);
}
