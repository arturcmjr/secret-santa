import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SpinnerOverlayComponent } from '../spinner-overlay/spinner-overlay.component';

@Component({
  selector: 'app-container',
  imports: [
    RouterOutlet,
    TranslatePipe,
    HeaderComponent,
    FooterComponent,
    SpinnerOverlayComponent,
  ],
  templateUrl: './app-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppContainerComponent {
  private readonly router = inject(Router);
  protected readonly showFooter = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) route = route.firstChild;
        return route.data['hideFooter'] !== true;
      })
    ),
    { initialValue: true }
  );
}