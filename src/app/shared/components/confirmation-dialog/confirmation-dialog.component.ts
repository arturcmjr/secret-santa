import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent implements AfterViewInit {
  @ViewChild('dialog') private dialog?: ElementRef<HTMLDialogElement>;
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly result = output<boolean>();

  ngAfterViewInit(): void {
    this.dialog?.nativeElement.showModal();
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.finish(false);
  }

  protected finish(confirmed: boolean): void {
    this.dialog?.nativeElement.close();
    this.result.emit(confirmed);
  }
}
