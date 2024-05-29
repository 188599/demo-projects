import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SimpleDialogData {

  title: string;

  content: string;

  closeButtonText?: string;

}

@Component({
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content>{{ data.content }}</mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button mat-dialog-close cdkFocusInitial>{{ data.closeButtonText ?? 'Ok' }}</button>
    </mat-dialog-actions>
  `
})
export class SimpleDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: SimpleDialogData,
    public dialogRef: MatDialogRef<SimpleDialogComponent>
  ) { }

}
