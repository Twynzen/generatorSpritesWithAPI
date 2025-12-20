import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoModelType, VIDEO_MODELS, VideoModelInfo } from '../../../core/models/video-model.model';

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './model-selector.component.html',
  styleUrls: ['./model-selector.component.scss']
})
export class ModelSelectorComponent {
  // Inputs
  selectedModel = input<VideoModelType>('luma-dream-machine');
  duration = input<number>(5);

  // Outputs
  modelChange = output<VideoModelType>();
  durationChange = output<number>();

  // Available models
  readonly models: VideoModelInfo[] = Object.values(VIDEO_MODELS);

  // Duration options for Kling
  readonly durationOptions = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' }
  ];

  onModelChange(modelId: VideoModelType): void {
    this.modelChange.emit(modelId);
  }

  onDurationChange(duration: number): void {
    this.durationChange.emit(duration);
  }

  getModelPrice(model: VideoModelInfo): string {
    if (model.pricePerVideo) {
      return `$${model.pricePerVideo.toFixed(2)}/video`;
    }
    if (model.pricePerSecond) {
      return `$${model.pricePerSecond.toFixed(3)}/sec`;
    }
    return 'Free';
  }
}
