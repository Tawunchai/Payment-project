// src/interface/ICarCatalog.ts
export interface BrandInterface {
  ID: number;
  BrandName: string;
}

export interface ModalInterface {
  ID: number;
  ModalName: string;
  BrandID?: number;
  Brand?: BrandInterface | null;
  CreatedAt?: string;
  UpdatedAt?: string;
}
