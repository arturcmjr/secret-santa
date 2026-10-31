import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, LucidePlus, ThemeToggleComponent],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}