import { Component, input, output } from '@angular/core';
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

  // Output when aspect ratio changes
  aspectRatioChange = output<AspectRatio>();

  // Available aspect ratios (Luma Dream Machine supported values)
  readonly aspectRatios: { value: AspectRatio; label: string; description: string }[] = [
    { value: '4:3', label: '4:3', description: 'Classic - Ideal for sprites' },
    { value: '16:9', label: '16:9', description: 'Widescreen' },
    { value: '9:16', label: '9:16', description: 'Portrait/Mobile' },
    { value: '3:4', label: '3:4', description: 'Portrait classic' }
  ];

  onAspectRatioChange(newAspectRatio: AspectRatio): void {
    this.aspectRatioChange.emit(newAspectRatio);
  }
}
