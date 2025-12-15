import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { GenerationHistoryItem } from '../../core/models/video-generation.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  storageService = inject(StorageService);

  /**
   * Opens video in new tab
   */
  openVideo(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Downloads the video
   */
  downloadVideo(item: GenerationHistoryItem): void {
    const link = document.createElement('a');
    link.href = item.videoUrl;
    link.download = `sprite_animation_${item.id}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Removes item from history
   */
  removeItem(id: string): void {
    if (confirm('Are you sure you want to remove this item from history?')) {
      this.storageService.removeFromHistory(id);
    }
  }

  /**
   * Clears all history
   */
  clearHistory(): void {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      this.storageService.clearHistory();
    }
  }
}
