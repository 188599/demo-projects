import { CdkCellDef, CdkTableDataSourceInput } from '@angular/cdk/table';
import { Directive, Input } from '@angular/core';
import { MatCellDef } from '@angular/material/table';

@Directive({
  selector: '[matCellDef]',
  standalone: true,
  providers: [{ provide: CdkCellDef, useExisting: TypeSafeMatCellDefDirective }],

})
export class TypeSafeMatCellDefDirective<T> extends MatCellDef {

  @Input()
  public matCellDefDataSource!: CdkTableDataSourceInput<T>


  static ngTemplateContextGuard<T>(
    dir: TypeSafeMatCellDefDirective<T>,
    ctx: unknown): ctx is { $implicit: T, index: number } {
    return true;
  }

}
