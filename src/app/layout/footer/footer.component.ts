import { ChangeDetectionStrategy, Component } from '@angular/core';
import { version } from '../../../../package.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly version = version;
}
