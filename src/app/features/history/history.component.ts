import { Component, inject, signal } from '@angular/core';
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

  // Download queue state
  isDownloading = signal(false);
  downloadProgress = signal(0);
  downloadTotal = signal(0);

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

  /**
   * Downloads all videos sequentially
   */
  async downloadAll(): Promise<void> {
    const history = this.storageService.history();
    if (history.length === 0) return;

    this.isDownloading.set(true);
    this.downloadTotal.set(history.length);
    this.downloadProgress.set(0);

    for (let i = 0; i < history.length; i++) {
      const item = history[i];
      this.downloadProgress.set(i + 1);

      try {
        const response = await fetch(item.videoUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        const name = item.prompt?.slice(0, 30).replace(/[^a-z0-9]/gi, '_') || 'animation';
        link.href = url;
        link.download = `${date}_${name}_${item.id.slice(-6)}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (i < history.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error) {
        console.error(`Error downloading video ${item.id}:`, error);
      }
    }

    this.isDownloading.set(false);
  }

  /**
   * Exports history metadata as JSON
   */
  exportHistory(): void {
    const history = this.storageService.history();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprite_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
