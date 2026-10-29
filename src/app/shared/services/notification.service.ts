import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public readonly message = signal('');

  private timeout?: ReturnType<typeof setTimeout>;

  public show(message: string): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.message.set(message);
    this.timeout = setTimeout(() => this.message.set(''), 2500);
  }
}
