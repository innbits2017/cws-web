
import { apiGet } from "./client";

export interface MaterialParameter {
  id: number;
  materialCode: string;
  revision: string;
  parameterName: string;
  parameterType: string;
  defaultValue: string;
  unit: string | null;
  isRequired: boolean;
  displayOrder: number;
}

export async function getMaterialParameters(
  materialCode?: string,
  revision?: string
): Promise<MaterialParameter[]> {
  const params = new URLSearchParams();

  if (materialCode) params.set("materialCode", materialCode);
  if (revision) params.set("revision", revision);

  const query = params.toString();

  return apiGet<MaterialParameter[]>(
    `/api/materialparameters${query ? `?${query}` : ""}`
  );
}
