import { Component, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MotionReferenceFile {
  file: File;
  url: string;
}

@Component({
  selector: 'app-motion-reference',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motion-reference.component.html',
  styleUrls: ['./motion-reference.component.scss']
})
export class MotionReferenceComponent {
  // Input for existing reference
  motionRef = input<MotionReferenceFile | null>(null);

  // Outputs
  fileSelected = output<MotionReferenceFile>();
  remove = output<void>();
  error = output<string>();

  // State
  isDragOver = signal(false);
  isLoading = signal(false);

  // Accepted video formats
  private readonly acceptedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB max

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
      input.value = '';
    }
  }

  onRemove(): void {
    this.remove.emit();
  }

  private processFile(file: File): void {
    // Validate format
    if (!this.acceptedFormats.includes(file.type)) {
      this.error.emit('Invalid format. Please use MP4, WebM, or MOV.');
      return;
    }

    // Validate size
    if (file.size > this.maxFileSize) {
      this.error.emit('Video too large. Maximum size is 50MB.');
      return;
    }

    this.isLoading.set(true);

    // Create preview URL
    const url = URL.createObjectURL(file);

    this.isLoading.set(false);
    this.fileSelected.emit({ file, url });
  }
}
