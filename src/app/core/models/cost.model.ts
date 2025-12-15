export type Resolution = '480p' | '720p';

export interface CostEstimate {
  resolution: Resolution;
  pricePerVideo: number;
  priceFormatted: string;
  currency: string;
  model: string;
  provider: string;
  notes?: string;
  quantity?: number;
  totalPrice?: number;
  totalPriceFormatted?: string;
}
