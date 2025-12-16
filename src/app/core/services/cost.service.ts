import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CostEstimate, AspectRatio } from '../models/cost.model';

@Injectable({
  providedIn: 'root'
})
export class CostService {

  private pricing = environment.pricing;

  /**
   * Calculates the estimated cost for a generation
   * Luma Dream Machine has fixed pricing regardless of aspect ratio
   */
  calculateCost(aspectRatio: AspectRatio): CostEstimate {
    return {
      aspectRatio,
      pricePerVideo: this.pricing.pricePerVideo,
      priceFormatted: this.formatPrice(this.pricing.pricePerVideo),
      currency: 'USD',
      model: this.pricing.model,
      provider: this.pricing.provider,
      notes: this.getAspectRatioNotes(aspectRatio)
    };
  }

  /**
   * Calculates cost for multiple generations
   */
  calculateBatchCost(aspectRatio: AspectRatio, quantity: number): CostEstimate {
    const singleCost = this.calculateCost(aspectRatio);
    const totalPrice = singleCost.pricePerVideo * quantity;

    return {
      ...singleCost,
      quantity,
      totalPrice,
      totalPriceFormatted: this.formatPrice(totalPrice)
    };
  }

  /**
   * Formats price to string
   */
  private formatPrice(price: number): string {
    return `$${price.toFixed(2)} USD`;
  }

  /**
   * Notes based on aspect ratio
   */
  private getAspectRatioNotes(aspectRatio: AspectRatio): string {
    switch (aspectRatio) {
      case '4:3':
        return 'Classic - Ideal for game sprites';
      case '3:4':
        return 'Portrait classic';
      case '16:9':
        return 'Widescreen - Best for scenes';
      case '9:16':
        return 'Portrait - Mobile format';
      case '21:9':
        return 'Ultra-wide cinematic';
      case '9:21':
        return 'Ultra-tall portrait';
      default:
        return '';
    }
  }
}
