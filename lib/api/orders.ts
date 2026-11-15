
import { apiGet } from "./client";

export interface Order {
  orderId: string;
  batchId: string;
  sequenceNo: number;
  configurationId: string | null;
  orderStatus: string;
  errorModeMessage: string | null;
  cadConfigurationSeconds: number | null;
  cadRegenerationLoops: number;
  resultFileAvailable: boolean;
  createdAt: string;
}

export async function getOrdersByBatch(
  batchId: string
): Promise<Order[]> {
  return apiGet<Order[]>(
    `/api/orders/batch/${encodeURIComponent(batchId)}`
  );
}
