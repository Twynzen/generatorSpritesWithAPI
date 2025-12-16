import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostEstimate, AspectRatio } from '../../../core/models/cost.model';

@Component({
  selector: 'app-cost-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cost-display.component.html',
  styleUrls: ['./cost-display.component.scss']
})
export class CostDisplayComponent {
  // Inputs
  costEstimate = input.required<CostEstimate>();
  aspectRatio = input<AspectRatio | string>('4:3');
  supportedAspectRatios = input<string[]>(['16:9', '9:16', '4:3', '3:4']);

  // Output when aspect ratio changes
  aspectRatioChange = output<AspectRatio>();

  // Filter aspect ratios based on model support
  readonly aspectRatios = computed(() => {
    const supported = this.supportedAspectRatios();

    // If model uses input-based, hide the selector
    if (supported.includes('input-based')) {
      return [];
    }

    const allOptions: { value: string; label: string }[] = [
      { value: 'auto', label: 'Auto' },
      { value: '16:9', label: '16:9' },
      { value: '9:16', label: '9:16' },
      { value: '4:3', label: '4:3' },
      { value: '3:4', label: '3:4' },
      { value: '21:9', label: '21:9' },
      { value: '9:21', label: '9:21' },
      { value: '1:1', label: '1:1' }
    ];

    return allOptions.filter(opt => supported.includes(opt.value));
  });

  onAspectRatioChange(newAspectRatio: string): void {
    this.aspectRatioChange.emit(newAspectRatio as AspectRatio);
  }
}
