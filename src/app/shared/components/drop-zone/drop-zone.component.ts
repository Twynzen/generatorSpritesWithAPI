import { Component, output, signal, inject, HostListener } from '@angular/core';
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

  /**
   * Listen for Ctrl+V paste events globally
   */
  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    // Don't process if already loading
    if (this.isLoading()) return;

    // Don't intercept if user is typing in an input/textarea
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement) {
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) return;

    // Find image in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          this.processFile(file);
        }
        return;
      }
    }
  }

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
