import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CostEstimate, Resolution } from '../models/cost.model';

@Injectable({
  providedIn: 'root'
})
export class CostService {

  private pricing = environment.pricing;

  /**
   * Calculates the estimated cost for a generation
   */
  calculateCost(resolution: Resolution): CostEstimate {
    const pricePerVideo = this.pricing[resolution];

    return {
      resolution,
      pricePerVideo,
      priceFormatted: this.formatPrice(pricePerVideo),
      currency: 'USD',
      model: 'Wan 2.1 FLF2V',
      provider: 'FAL.ai',
      notes: this.getCostNotes(resolution)
    };
  }

  /**
   * Calculates cost for multiple generations
   */
  calculateBatchCost(resolution: Resolution, quantity: number): CostEstimate {
    const singleCost = this.calculateCost(resolution);
    const totalPrice = singleCost.pricePerVideo * quantity;

    return {
      ...singleCost,
      quantity,
      totalPrice,
      totalPriceFormatted: this.formatPrice(totalPrice)
    };
  }

  /**
   * Gets pricing info to show the user
   */
  getPricingInfo(): { resolution: Resolution; price: number; priceFormatted: string }[] {
    return Object.entries(this.pricing).map(([resolution, price]) => ({
      resolution: resolution as Resolution,
      price,
      priceFormatted: this.formatPrice(price)
    }));
  }

  /**
   * Formats price to string
   */
  private formatPrice(price: number): string {
    return `$${price.toFixed(2)} USD`;
  }

  /**
   * Additional notes based on resolution
   */
  private getCostNotes(resolution: Resolution): string {
    switch (resolution) {
      case '480p':
        return 'Standard resolution, ideal for 2D game sprites';
      case '720p':
        return 'High resolution, better quality but more expensive';
      default:
        return '';
    }
  }
}
