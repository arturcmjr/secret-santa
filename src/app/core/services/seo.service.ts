import { DOCUMENT } from '@angular/common';
import { inject, Injectable, PendingTasks } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '@env';
import { filter, firstValueFrom } from 'rxjs';

export interface ISeoRouteData {
  titleKey: string;
  descriptionKey: string;
  noindex?: boolean;
  canonicalPath?: string;
}

export interface ISeoConfig {
  title: string;
  description: string;
  noindex?: boolean;
  canonicalPath?: string;
}

const SITE_NAME = 'Amiko';
const LOCALE = 'pt_BR';
const OG_IMAGE_PATH = '/assets/img/og-image.png';
const MAX_DESCRIPTION_LENGTH = 200;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly document = inject(DOCUMENT);

  // Applies the `seo` data of the activated route; pages with dynamic content call `update` themselves
  public init(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) route = route.firstChild;
        const data = route.data['seo'] as ISeoRouteData | undefined;
        if (!data) return;
        void this.pendingTasks.run(async () => {
          const [title, description] = await Promise.all([
            this.translateKey(data.titleKey),
            this.translateKey(data.descriptionKey),
          ]);
          this.update({ title, description, noindex: data.noindex, canonicalPath: data.canonicalPath });
        });
      });
  }

  public translateKey(key: string, params?: object): Promise<string> {
    return firstValueFrom(this.translate.get(key, params));
  }

  // Events are created by Brazilian users, so the day is read in that timezone regardless of the server's
  public formatEventDate(value: unknown): string {
    const date =
      value && typeof value === 'object' && 'toDate' in value
        ? (value as { toDate(): Date }).toDate()
        : new Date(value as Date | string | number);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(this.translate.currentLang() || 'pt', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });
  }

  public async updateNotFound(): Promise<void> {
    const [title, description] = await Promise.all([
      this.translateKey('SEO.NOT_FOUND.TITLE'),
      this.translateKey('SEO.NOT_FOUND.DESCRIPTION'),
    ]);
    this.update({ title, description, noindex: true });
  }

  public update({ title, description, noindex, canonicalPath }: ISeoConfig): void {
    const url = this.canonicalUrl(canonicalPath);
    const image = `${environment.siteUrl}${OG_IMAGE_PATH}`;
    const summary = this.truncate(description);

    this.title.setTitle(title);
    this.setTag('name', 'description', summary);
    this.setTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    this.setLink('canonical', url);

    this.setTag('property', 'og:type', 'website');
    this.setTag('property', 'og:site_name', SITE_NAME);
    this.setTag('property', 'og:locale', LOCALE);
    this.setTag('property', 'og:url', url);
    this.setTag('property', 'og:title', title);
    this.setTag('property', 'og:description', summary);
    this.setTag('property', 'og:image', image);
    this.setTag('property', 'og:image:width', '1200');
    this.setTag('property', 'og:image:height', '630');
    this.setTag('property', 'og:image:alt', SITE_NAME);

    this.setTag('name', 'twitter:card', 'summary_large_image');
    this.setTag('name', 'twitter:title', title);
    this.setTag('name', 'twitter:description', summary);
    this.setTag('name', 'twitter:image', image);
  }

  // Query strings and fragments never belong to the canonical address
  private canonicalUrl(canonicalPath?: string): string {
    const path = canonicalPath ?? this.router.url.split(/[?#]/)[0];
    return `${environment.siteUrl}${path}`;
  }

  private truncate(text: string): string {
    const clean = text.replace(/\s+/g, ' ').trim();
    return clean.length > MAX_DESCRIPTION_LENGTH
      ? `${clean.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
      : clean;
  }

  private setTag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content }, `${attr}='${key}'`);
  }

  private setLink(rel: string, href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
