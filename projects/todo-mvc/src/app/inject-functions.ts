import { ChangeDetectorRef, inject, ViewRef } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';

export function injectRxState<T extends object>() {
  const rxState = new RxState<T>();
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef.onDestroy(() => rxState.ngOnDestroy());

  return rxState;
}

export function injectRxActionFactory<T extends Partial<object>>() {
  const actionFactory = new RxActionFactory<T>();
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef.onDestroy(() => actionFactory.ngOnDestroy());

  return actionFactory;
}
