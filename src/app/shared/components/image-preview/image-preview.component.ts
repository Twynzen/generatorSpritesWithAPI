import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageMetadata } from '../../../core/models/image-metadata.model';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})
export class ImagePreviewComponent {
  // Inputs
  metadata = input.required<ImageMetadata>();
  label = input<string>('Image');
  removable = input<boolean>(true);

  // Outputs
  remove = output<void>();

  // Computed
  dimensionsText = computed(() => {
    const m = this.metadata();
    return `${m.width} x ${m.height}px`;
  });
}
