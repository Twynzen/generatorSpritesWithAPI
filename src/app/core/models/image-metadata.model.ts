export interface ImageMetadata {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  format: string;
  width: number;
  height: number;
  aspectRatio: string;
  lastModified: Date;
  objectUrl: string;
}

export interface ProcessedImage {
  file: File;
  metadata: ImageMetadata;
  uploadedUrl?: string; // URL in FAL storage after upload
}
