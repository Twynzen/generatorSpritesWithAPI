import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  VIDEO_MODELS,
  VideoModelConfig,
  ModelTier,
  DEFAULT_MODEL,
  getModelsByTier
} from '../../../core/constants/api.constants';

type SortMode = 'quality' | 'speed' | 'cost';

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './model-selector.component.html',
  styleUrls: ['./model-selector.component.scss']
})
export class ModelSelectorComponent {
  @Input() set selectedModelId(value: string) {
    const model = VIDEO_MODELS.find(m => m.id === value);
    if (model) {
      this._selectedModel.set(model);
    }
  }

  @Output() modelChange = new EventEmitter<VideoModelConfig>();

  // Internal state
  private _selectedModel = signal<VideoModelConfig>(DEFAULT_MODEL);
  readonly sortMode = signal<SortMode>('quality');
  readonly isExpanded = signal(false);

  // Computed values
  readonly selectedModel = computed(() => this._selectedModel());

  readonly premiumModels = computed(() => this.getSortedModels('premium'));
  readonly balancedModels = computed(() => this.getSortedModels('balanced'));
  readonly economyModels = computed(() => this.getSortedModels('economy'));

  readonly qualityStars = computed(() => {
    const model = this._selectedModel();
    return '★'.repeat(model.quality) + '☆'.repeat(5 - model.quality);
  });

  // Methods
  private getSortedModels(tier: ModelTier): VideoModelConfig[] {
    const models = getModelsByTier(tier);
    const mode = this.sortMode();

    switch (mode) {
      case 'quality':
        return [...models].sort((a, b) => b.quality - a.quality);
      case 'speed':
        return [...models].sort((a, b) => this.parseTime(a.estimatedTime) - this.parseTime(b.estimatedTime));
      case 'cost':
        return [...models].sort((a, b) => a.costPerVideo - b.costPerVideo);
      default:
        return models;
    }
  }

  private parseTime(time: string): number {
    if (time.includes('<5s')) return 5;
    if (time.includes('~10s')) return 10;
    if (time.includes('~20s')) return 20;
    if (time.includes('~30s')) return 30;
    if (time.includes('~1 min')) return 60;
    if (time.includes('1-2 min')) return 90;
    if (time.includes('~2 min')) return 120;
    if (time.includes('2-3 min')) return 150;
    if (time.includes('2-4 min')) return 180;
    if (time.includes('3-5 min')) return 240;
    if (time.includes('~4 min')) return 240;
    return 300;
  }

  onSortModeChange(mode: SortMode): void {
    this.sortMode.set(mode);
  }

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  selectModel(model: VideoModelConfig): void {
    this._selectedModel.set(model);
    this.modelChange.emit(model);
  }

  getTierLabel(tier: ModelTier): string {
    switch (tier) {
      case 'premium': return '⭐ Premium';
      case 'balanced': return '⚖️ Balanced';
      case 'economy': return '💰 Economy';
    }
  }

  getTierDescription(tier: ModelTier): string {
    switch (tier) {
      case 'premium': return 'Highest quality, cinematic results';
      case 'balanced': return 'Good quality at reasonable cost';
      case 'economy': return 'Fast and cheap for prototyping';
    }
  }
}
