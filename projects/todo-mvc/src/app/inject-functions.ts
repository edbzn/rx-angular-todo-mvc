import { DestroyRef, inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';

export function injectRxState<T extends object>() {
  const rxState = new RxState<T>();
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => rxState.ngOnDestroy());

  return rxState;
}

export function injectRxActionFactory<T extends Partial<object>>() {
  const actionFactory = new RxActionFactory<T>();
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => actionFactory.ngOnDestroy());

  return actionFactory;
}
