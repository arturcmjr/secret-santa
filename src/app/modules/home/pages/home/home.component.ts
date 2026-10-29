import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MainLogoComponent } from '@shared/components/main-logo/main-logo.component';
import { ButtonDirective } from '@shared/directives/button.directive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe, MainLogoComponent, ButtonDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
