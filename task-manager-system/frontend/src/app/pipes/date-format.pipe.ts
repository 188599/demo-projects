import { Pipe, PipeTransform } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | Dayjs, utc?: boolean): string {
    const format = 'M/D/YYYY';

    if (utc) return dayjs.utc(value).format(format);

    return dayjs(value).format(format);
  }

}
