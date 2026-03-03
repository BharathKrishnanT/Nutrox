import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Impure because it depends on a signal that changes
})
export class TranslatePipe implements PipeTransform {
  translationService = inject(TranslationService);

  transform(key: string): string {
    return this.translationService.translate(key);
  }
}
