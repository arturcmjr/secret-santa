import { Injectable, signal } from '@angular/core';
import {
  SavedLink,
  SavedLinkType,
} from '@features/dashboard/models/saved-link.interface';

const STORAGE_KEY = 'secret-santa:saved-links';
const STORAGE_VERSION = 1;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface IStoredData {
  version: number;
  links: SavedLink[];
}

type EventDate = Date | { toDate(): Date } | string | number | null | undefined;

@Injectable({ providedIn: 'root' })
export class SavedLinksService {
  private readonly linksSignal = signal<SavedLink[]>(this.load());

  public readonly links = this.linksSignal.asReadonly();

  // Reads from storage, drops expired entries (also from storage) and returns the rest
  public refresh(): SavedLink[] {
    this.linksSignal.set(this.load());
    return this.linksSignal();
  }

  public hasLinks(): boolean {
    return this.load().length > 0;
  }

  public registerReveal(
    participantId: string,
    participantName: string,
    secretSantaName: string,
    eventDate: EventDate
  ): void {
    this.register({
      type: SavedLinkType.Reveal,
      id: participantId,
      name: secretSantaName,
      participantName,
      eventDate: '',
      path: `/participant/${participantId}`,
      savedAt: 0,
    }, eventDate);
  }

  public registerManage(
    secretSantaId: string,
    secretSantaName: string,
    eventDate: EventDate
  ): void {
    this.register({
      type: SavedLinkType.Manage,
      id: secretSantaId,
      name: secretSantaName,
      eventDate: '',
      path: `/share/${secretSantaId}`,
      savedAt: 0,
    }, eventDate);
  }

  public remove(type: SavedLinkType, id: string): void {
    this.save(this.load().filter((link) => !(link.type === type && link.id === id)));
  }

  // An event is expired on its own date or any day after, using the user's local calendar day
  public isExpired(eventDate: string, now = new Date()): boolean {
    return eventDate <= this.toDateKey(now);
  }

  private register(link: SavedLink, eventDate: EventDate): void {
    const date = this.toDateKey(this.toDate(eventDate));
    if (!link.id || !date || !DATE_PATTERN.test(date)) return;

    const entry = { ...link, eventDate: date, savedAt: Date.now() } as SavedLink;
    const others = this.load().filter(
      (item) => !(item.type === entry.type && item.id === entry.id)
    );
    // upsert: the same link updates the existing entry instead of duplicating it
    if (!this.isExpired(date)) this.save([entry, ...others]);
    else this.save(others);
  }

  private load(): SavedLink[] {
    const stored = this.read();
    const valid = stored.filter(
      (link) => this.isValid(link) && !this.isExpired(link.eventDate)
    );
    if (valid.length !== stored.length) this.write(valid);
    return valid;
  }

  private save(links: SavedLink[]): void {
    this.write(links);
    this.linksSignal.set(links);
  }

  private read(): SavedLink[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw) as Partial<IStoredData>;
      if (data?.version !== STORAGE_VERSION || !Array.isArray(data.links)) return [];
      return data.links;
    } catch {
      return [];
    }
  }

  private write(links: SavedLink[]): void {
    try {
      if (links.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const data: IStoredData = { version: STORAGE_VERSION, links };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // storage unavailable or full: tracking is best-effort
    }
  }

  private isValid(link: unknown): link is SavedLink {
    const item = link as Partial<SavedLink> & { participantName?: unknown };
    if (!item || typeof item !== 'object') return false;
    const common =
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.path === 'string' &&
      item.path.startsWith('/') &&
      typeof item.eventDate === 'string' &&
      DATE_PATTERN.test(item.eventDate);
    if (!common) return false;
    if (item.type === SavedLinkType.Reveal) return typeof item.participantName === 'string';
    return item.type === SavedLinkType.Manage;
  }

  private toDate(value: EventDate): Date | undefined {
    if (value === null || value === undefined) return undefined;
    const date =
      typeof value === 'object' && 'toDate' in value
        ? value.toDate()
        : new Date(value as Date | string | number);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private toDateKey(date: Date | undefined): string {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
