
import { Pipe, PipeTransform, inject } from '@angular/core';
import { RestService } from '../services/rest.service';

@Pipe({
  name: 'localimage',
  standalone: true
})
export class LocalImagePipe implements PipeTransform {

  private rest = inject(RestService);

  transform(value: number | null | undefined): string {
    if (value) {
      return `${this.rest.base_url}/image.php?id=${value}`;
    } else {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  }
}
