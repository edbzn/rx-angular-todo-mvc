import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef
} from '@angular/core';
import { Suspense, suspensify } from '@jscutlery/operators';
import { IfModule } from '@rx-angular/template/if';
import { PushModule } from '@rx-angular/template/push';
import { EMPTY, Observable } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-suspense',
  standalone: true,
  imports: [PushModule, IfModule, NgTemplateOutlet],
  styles: [
    `
      :host {
        display: block;
      }

      .message {
        text-align: center;
        padding: 15px 15px 15px 60px;
        line-height: 1.2;
        color: #cdcdcd;
        font-weight: 400;
        font-size: 24px;
      }
    `,
  ],
  template: `
    <ng-container *rxIf="suspense$ as suspense">
      <!-- Data. -->
      <ng-container *rxIf="suspense.value as data">
        <ng-container
          *ngTemplateOutlet="dataTemplate; context: { $implicit: data }"
        >
        </ng-container>

        <!-- Empty data. -->
        <ng-container *rxIf="suspense.value?.length === 0">
          <div class="message">Nothing to do.</div>
        </ng-container>
      </ng-container>

      <!-- Loading. -->
      <ng-container *rxIf="suspense.pending">
        <ng-container *ngTemplateOutlet="suspenseTemplate"> </ng-container>
      </ng-container>
    </ng-container>

    <ng-template #suspenseTemplate>
      <div class="message">Loading tasks, please wait.</div>
    </ng-template>
  `,
})
export class SuspenseComponent<T = unknown> {
  @ContentChild('data') dataTemplate!: TemplateRef<{ $implicit: T }>;
  @ContentChild('suspense') suspenseTemplate!: TemplateRef<undefined>;

  @Input() set data$(data$: Observable<T>) {
    this.suspense$ = data$?.pipe(suspensify());
  }

  suspense$: Observable<Suspense<T>> = EMPTY;
}
