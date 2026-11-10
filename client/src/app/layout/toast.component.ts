import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `<div class="toast" [class.show]="toast.visible()" role="status">{{ toast.message() }}</div>`,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);
}
