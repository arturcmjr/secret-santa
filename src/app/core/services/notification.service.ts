import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMessage {
  text: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly message = signal<NotificationMessage | null>(null);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(text: string, type: NotificationType = 'success'): void {
    this.message.set({ text, type });
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.dismiss(), 3500);
  }

  dismiss(): void {
    clearTimeout(this.timeoutId);
    this.message.set(null);
  }
}
