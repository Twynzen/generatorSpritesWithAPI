import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ImageMetadata } from '../models/image-metadata.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  // Supported image formats
  readonly supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Max size: 10MB
  readonly maxFileSize = 10 * 1024 * 1024;

  /**
   * Validates that the file is a valid image
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    if (!this.supportedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported format. Use: ${this.supportedFormats.map(f => f.split('/')[1]).join(', ')}`
      };
    }

    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum: ${this.formatFileSize(this.maxFileSize)}`
      };
    }

    return { valid: true };
  }

  /**
   * Extracts metadata from an image (dimensions, size, etc.)
   */
  getImageMetadata(file: File): Observable<ImageMetadata> {
    return from(new Promise<ImageMetadata>((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        resolve({
          name: file.name,
          size: file.size,
          sizeFormatted: this.formatFileSize(file.size),
          type: file.type,
          format: file.type.split('/')[1].toUpperCase(),
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: this.calculateAspectRatio(img.naturalWidth, img.naturalHeight),
          lastModified: new Date(file.lastModified),
          objectUrl: URL.createObjectURL(file) // New URL for preview
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Error loading image'));
      };

      img.src = objectUrl;
    }));
  }

  /**
   * Converts File to base64 (for local preview)
   */
  fileToBase64(file: File): Observable<string> {
    return from(new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));
  }

  /**
   * Formats bytes to readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculates simplified aspect ratio
   */
  private calculateAspectRatio(width: number, height: number): string {
    const gcd = this.gcd(width, height);
    const w = width / gcd;
    const h = height / gcd;

    // If too complex, show decimal
    if (w > 21 || h > 21) {
      return (width / height).toFixed(2) + ':1';
    }

    return `${w}:${h}`;
  }

  /**
   * Greatest common divisor
   */
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }
}
