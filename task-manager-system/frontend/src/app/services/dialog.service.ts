import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from '../components/simple-dialog/simple-dialog.component';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }


  public alert(title: string, content: string) {
    return this.createDialog({ title, content });
  }

  public confirmAction(title: string, content: string, confirmText = 'Yes', denyText = 'No') {
    return this.createDialog({ title, content, okButtonText: confirmText, cancelButtonText: denyText, cancelButton: true })
      .beforeClosed()
      .pipe(map(dialogResult => ({ confirmed: dialogResult?.cancel == false })));
  }


  private createDialog(options: SimpleDialogData) {
    return this.dialog.open(SimpleDialogComponent, { data: options });
  }

}
