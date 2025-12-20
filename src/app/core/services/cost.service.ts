import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CostEstimate, AspectRatio } from '../models/cost.model';
import { VideoModelType, VIDEO_MODELS } from '../models/video-model.model';

@Injectable({
  providedIn: 'root'
})
export class CostService {

  private pricing = environment.pricing;

  /**
   * Calculates the estimated cost for a generation based on model
   */
  calculateCost(aspectRatio: AspectRatio, model: VideoModelType = 'luma-dream-machine', duration: number = 5): CostEstimate {
    const modelInfo = VIDEO_MODELS[model];
    const modelPricing = this.pricing[model];

    let pricePerVideo: number;

    if ('pricePerVideo' in modelPricing) {
      pricePerVideo = modelPricing.pricePerVideo;
    } else if ('pricePerSecond' in modelPricing) {
      pricePerVideo = modelPricing.pricePerSecond * duration;
    } else {
      pricePerVideo = 0;
    }

    return {
      aspectRatio,
      pricePerVideo,
      priceFormatted: this.formatPrice(pricePerVideo),
      currency: 'USD',
      model: modelInfo.name,
      provider: modelInfo.provider,
      notes: this.getModelNotes(model, duration)
    };
  }

  /**
   * Calculates cost for multiple generations
   */
  calculateBatchCost(aspectRatio: AspectRatio, quantity: number, model: VideoModelType = 'luma-dream-machine', duration: number = 5): CostEstimate {
    const singleCost = this.calculateCost(aspectRatio, model, duration);
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
   * Notes based on model and duration
   */
  private getModelNotes(model: VideoModelType, duration: number): string {
    if (model === 'luma-dream-machine') {
      return '5s loop animation';
    } else if (model === 'kling-v2.6') {
      return `${duration}s video with motion control`;
    }
    return '';
  }

  /**
   * Get aspect ratio description
   */
  getAspectRatioDescription(aspectRatio: AspectRatio): string {
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
