import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { RouterLink } from '@angular/router';
import {
  LucideCopy,
  LucideExternalLink,
  LucideGift,
  LucideSettings2,
  LucideX,
} from '@lucide/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@core/services/notification.service';
import { SavedLinksService } from '@core/services/saved-links.service';
import { DefaultPageLayoutComponent } from '@layout/default-page-layout/default-page-layout.component';
import {
  SavedLink,
  SavedLinkType,
} from '@features/dashboard/models/saved-link.interface';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    TranslatePipe,
    LucideCopy,
    LucideExternalLink,
    LucideGift,
    LucideSettings2,
    LucideX,
    DefaultPageLayoutComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly savedLinks = inject(SavedLinksService);
  private readonly clipboard = inject(Clipboard);
  private readonly notification = inject(NotificationService);
  private readonly translate = inject(TranslateService);

  protected readonly SavedLinkType = SavedLinkType;
  // soonest events first
  protected readonly links = computed(() =>
    [...this.savedLinks.links()].sort((a, b) => a.eventDate.localeCompare(b.eventDate))
  );

  public ngOnInit(): void {
    this.savedLinks.refresh();
  }

  protected formatDate(eventDate: string): string {
    const [year, month, day] = eventDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(
      this.translate.currentLang() ?? undefined,
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  }

  protected copy(link: SavedLink): void {
    this.clipboard.copy(`${window.location.origin}${link.path}`);
    this.notification.show(this.translate.instant('MESSAGES.INFO_CLIPBOARD_SUCCESS'), 'success');
  }

  protected remove(link: SavedLink): void {
    this.savedLinks.remove(link.type, link.id);
  }

  protected trackKey(link: SavedLink): string {
    return `${link.type}:${link.id}`;
  }
}
