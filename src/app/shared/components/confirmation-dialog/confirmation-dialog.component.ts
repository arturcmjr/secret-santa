import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  protected title: string;
  protected message: string;

  readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  readonly data = inject<ConfirmDialogModel>(MAT_DIALOG_DATA);

  constructor() {
    this.title = this.data.title;
    this.message = this.data.message;
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }

  protected onDismiss(): void {
    this.dialogRef.close(false);
  }
}

export class ConfirmDialogModel {
  constructor(public title: string, public message: string) {}
}
