import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MainLogoComponent } from '../main-logo/main-logo.component';

@Component({
  selector: 'app-default-page-layout',
  imports: [NgTemplateOutlet, MainLogoComponent],
  templateUrl: './default-page-layout.component.html',
  styleUrl: './default-page-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPageLayoutComponent {
  public readonly title = input<string>();
  public readonly subTitle = input<string>();
  public readonly subTitleTemplate = input<TemplateRef<unknown>>();
}
