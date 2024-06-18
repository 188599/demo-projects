import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { defer, fromEvent, map } from 'rxjs';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ],
  template: `
    <input type="file" allowedTypes="image/*" (change)="onChange()" (blur)="onBlur()" #inputEl>
  `,
  styles: ``
})
export class ImageUploadComponent implements ControlValueAccessor {

  public inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');


  private image?: string;

  private onChanged!: (_value: any) => void;

  private onTouched!: () => void;


  public writeValue(value: string): void {
    this.image = value;
  }

  public registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public onChange() {
    const file = this.inputEl()!.nativeElement.files![0];

    const reader = new FileReader();

    const onLoad$ = defer(() => {
      reader.readAsDataURL(file);

      return fromEvent(reader, 'load').pipe(map(_ev => reader.result));
    });

    onLoad$.subscribe(this.onChanged);
  }

  public onBlur() {
    this.onTouched();
  }

}
