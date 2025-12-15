import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenerationStatus } from '../../../state/video-generator.state';

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss']
})
export class ProgressIndicatorComponent {
  // Inputs
  status = input.required<GenerationStatus>();
  progress = input<number>(0);
  logs = input<string[]>([]);

  // Computed
  statusText = computed(() => {
    switch (this.status()) {
      case 'uploading': return 'Uploading images...';
      case 'in_queue': return 'In processing queue...';
      case 'in_progress': return 'Generating video...';
      case 'completed': return 'Completed!';
      case 'failed': return 'Generation error';
      default: return '';
    }
  });

  statusIcon = computed(() => {
    switch (this.status()) {
      case 'uploading':
      case 'in_queue':
      case 'in_progress':
        return 'spinner';
      case 'completed':
        return 'check';
      case 'failed':
        return 'error';
      default:
        return '';
    }
  });
}
