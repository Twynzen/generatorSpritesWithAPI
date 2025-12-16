import { Injectable } from '@angular/core';
import { CostEstimate, AspectRatio } from '../models/cost.model';
import { VideoModelConfig, DEFAULT_MODEL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CostService {

  /**
   * Calculates the estimated cost for a generation using a specific model
   */
  calculateCostForModel(aspectRatio: AspectRatio | string, model: VideoModelConfig): CostEstimate {
    return {
      aspectRatio: aspectRatio as AspectRatio,
      pricePerVideo: model.costPerVideo,
      priceFormatted: this.formatPrice(model.costPerVideo),
      currency: 'USD',
      model: model.name,
      provider: model.provider,
      notes: this.getModelNotes(model)
    };
  }

  /**
   * Calculates the estimated cost using default model (backwards compatibility)
   */
  calculateCost(aspectRatio: AspectRatio): CostEstimate {
    return this.calculateCostForModel(aspectRatio, DEFAULT_MODEL);
  }

  /**
   * Calculates cost for multiple generations
   */
  calculateBatchCost(aspectRatio: AspectRatio, quantity: number, model?: VideoModelConfig): CostEstimate {
    const singleCost = model
      ? this.calculateCostForModel(aspectRatio, model)
      : this.calculateCost(aspectRatio);
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
   * Notes based on model characteristics
   */
  private getModelNotes(model: VideoModelConfig): string {
    const features: string[] = [];

    if (model.supportsLoop) {
      features.push('Loop support');
    }
    if (!model.promptRequired) {
      features.push('No prompt needed');
    }
    if (model.supportsNegativePrompt) {
      features.push('Negative prompt');
    }

    return features.length > 0
      ? `${model.description} - Features: ${features.join(', ')}`
      : model.description;
  }
}
