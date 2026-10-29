import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-default-page-layout',
  imports: [NgTemplateOutlet],
  templateUrl: './default-page-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPageLayoutComponent {
  public readonly title = input<string>();
  public readonly subTitle = input<string>();
  public readonly subTitleTemplate = input<TemplateRef<unknown>>();
}
