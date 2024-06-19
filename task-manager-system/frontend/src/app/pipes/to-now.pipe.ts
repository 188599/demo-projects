import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);

@Pipe({
  name: 'toNow',
  standalone: true
})
export class ToNowPipe implements PipeTransform {

  public transform(value: Date): string {
    return dayjs.utc(value).fromNow();
  }

}
