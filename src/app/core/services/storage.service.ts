import { Injectable, signal, computed } from '@angular/core';
import { GenerationHistoryItem } from '../models/video-generation.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly HISTORY_KEY = 'sprite_video_generator_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  // Signal for history
  private historySignal = signal<GenerationHistoryItem[]>(this.loadHistory());

  // Computed for public access
  readonly history = computed(() => this.historySignal());
  readonly historyCount = computed(() => this.historySignal().length);

  /**
   * Adds an item to history
   */
  addToHistory(item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>): void {
    const newItem: GenerationHistoryItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date()
    };

    const currentHistory = this.historySignal();
    const updatedHistory = [newItem, ...currentHistory].slice(0, this.MAX_HISTORY_ITEMS);

    this.historySignal.set(updatedHistory);
    this.saveHistory(updatedHistory);
  }

  /**
   * Removes an item from history
   */
  removeFromHistory(id: string): void {
    const updatedHistory = this.historySignal().filter(item => item.id !== id);
    this.historySignal.set(updatedHistory);
    this.saveHistory(updatedHistory);
  }

  /**
   * Clears all history
   */
  clearHistory(): void {
    this.historySignal.set([]);
    localStorage.removeItem(this.HISTORY_KEY);
  }

  /**
   * Loads history from localStorage
   */
  private loadHistory(): GenerationHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Convert date strings to Date objects
      return parsed.map((item: GenerationHistoryItem) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    } catch {
      return [];
    }
  }

  /**
   * Saves history to localStorage
   */
  private saveHistory(history: GenerationHistoryItem[]): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  /**
   * Generates unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
