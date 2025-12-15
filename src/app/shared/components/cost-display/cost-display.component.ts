import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CostEstimate, Resolution } from '../../../core/models/cost.model';

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
  resolution = input<Resolution>('480p');

  // Output when resolution changes
  resolutionChange = output<Resolution>();

  // Available resolutions
  readonly resolutions: { value: Resolution; label: string; description: string }[] = [
    { value: '480p', label: '480p', description: 'Standard - Ideal for sprites' },
    { value: '720p', label: '720p', description: 'High quality - Greater detail' }
  ];

  onResolutionChange(newResolution: Resolution): void {
    this.resolutionChange.emit(newResolution);
  }
}
