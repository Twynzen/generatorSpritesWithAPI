import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoResult } from '../../../core/models/video-generation.model';

@Component({
  selector: 'app-video-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-result.component.html',
  styleUrls: ['./video-result.component.scss']
})
export class VideoResultComponent {
  // Inputs
  video = input.required<VideoResult>();
  cost = input<number>(0);

  // Outputs
  download = output<void>();
  newGeneration = output<void>();

  /**
   * Downloads the video
   */
  downloadVideo(): void {
    const link = document.createElement('a');
    link.href = this.video().url;
    link.download = `sprite_animation_${Date.now()}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.download.emit();
  }
}
