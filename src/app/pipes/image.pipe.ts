
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'image',
  standalone: true
})
export class ImagePipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value) {
      return `https://uniformesprofesionales.integranet.xyz/api/image.php?id=${value}`;
    } else {
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  }
}
