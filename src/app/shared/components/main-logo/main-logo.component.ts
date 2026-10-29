import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-main-logo',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './main-logo.component.html',
  styleUrl: './main-logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLogoComponent {}
