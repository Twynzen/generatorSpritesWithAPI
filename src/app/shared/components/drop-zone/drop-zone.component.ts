import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../core/services/image.service';
import { ImageMetadata } from '../../../core/models/image-metadata.model';

@Component({
  selector: 'app-drop-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.scss']
})
export class DropZoneComponent {
  private imageService = inject(ImageService);

  // Outputs
  fileSelected = output<{ file: File; metadata: ImageMetadata }>();
  error = output<string>();

  // State
  isDragOver = signal(false);
  isLoading = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = ''; // Reset to allow selecting the same file
    }
  }

  private processFile(file: File): void {
    // Validate
    const validation = this.imageService.validateImage(file);
    if (!validation.valid) {
      this.error.emit(validation.error!);
      return;
    }

    // Get metadata
    this.isLoading.set(true);
    this.imageService.getImageMetadata(file).subscribe({
      next: (metadata) => {
        this.isLoading.set(false);
        this.fileSelected.emit({ file, metadata });
      },
      error: () => {
        this.isLoading.set(false);
        this.error.emit('Error processing the image');
      }
    });
  }
}
