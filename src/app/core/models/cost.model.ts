export type AspectRatio = '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';

export interface CostEstimate {
  aspectRatio: AspectRatio;
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
