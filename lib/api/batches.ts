
import { apiGet } from "./client";
import type { Material } from "./materials";
import type { MaterialParameter } from "./materialParameters";
import type { Order } from "./orders";

export interface Batch {
  batchId: string;
  name: string;
  description: string;
  ownerDisplayName: string;
  ownerEmail: string;
  materialCode: string;
  materialRevision: string;
  status: string;
  errorMode: boolean;
  skipMode: boolean;
  successRate: number;
  lastRunAt: string | null;
  batchSize: number;
  shared: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface BatchDetails {
  batch: Batch;
  material: Material | null;
  materialParameters: MaterialParameter[];
  orders: Order[];
  orderCount: number;
}

export async function getBatches(): Promise<Batch[]> {
  return apiGet<Batch[]>("/api/batches");
}

export async function getBatchById(batchId: string): Promise<Batch> {
  return apiGet<Batch>(`/api/batches/${encodeURIComponent(batchId)}`);
}

export async function getBatchDetails(
  batchId: string
): Promise<BatchDetails> {
  return apiGet<BatchDetails>(
    `/api/batches/${encodeURIComponent(batchId)}/details`
  );
}
