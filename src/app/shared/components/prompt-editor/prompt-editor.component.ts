import { Component, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SPRITE_PROMPTS, SpritePromptTemplate } from '../../../core/constants/prompts.constants';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-editor.component.html',
  styleUrls: ['./prompt-editor.component.scss']
})
export class PromptEditorComponent {
  // Two-way binding for prompt
  prompt = model<string>('');

  // Available templates
  readonly templates: SpritePromptTemplate[] = SPRITE_PROMPTS;

  // State
  selectedTemplate = signal<string | null>(null);

  /**
   * Applies a predefined template
   */
  applyTemplate(templateKey: string): void {
    const template = this.templates.find(t => t.key === templateKey);
    if (template) {
      this.prompt.set(template.prompt);
      this.selectedTemplate.set(templateKey);
    }
  }

  /**
   * Clears the prompt
   */
  clearPrompt(): void {
    this.prompt.set('');
    this.selectedTemplate.set(null);
  }
}
