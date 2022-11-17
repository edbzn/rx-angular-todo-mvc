import { ChangeDetectorRef, inject, Injectable, ViewRef } from '@angular/core';
import { RxState as State } from '@rx-angular/state';

@Injectable()
export class RxState<T extends object> extends State<T> {}

export function injectRxState<T extends object>() {
  const rxState = inject<RxState<T>>(RxState);
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef.onDestroy(() => rxState.ngOnDestroy());

  return rxState;
}
