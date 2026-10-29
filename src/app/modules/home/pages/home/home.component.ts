import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MainLogoComponent } from '@shared/components/main-logo/main-logo.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatAnchor, MatIcon, TranslatePipe, MainLogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
