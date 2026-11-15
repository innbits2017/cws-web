
import { apiGet } from "./client";

export interface Material {
  materialCode: string;
  revision: string;
  description: string;
  pdmDescription: string;
  isActive: boolean;
  createdAt: string;
}

export async function getMaterials(): Promise<Material[]> {
  return apiGet<Material[]>("/api/materials");
}
