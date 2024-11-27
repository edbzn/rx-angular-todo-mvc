import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  inject,
  viewChild,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { RxStrategyProvider } from '@rx-angular/cdk/render-strategies';
import { rxState } from '@rx-angular/state';
import { eventValue, rxActions } from '@rx-angular/state/actions';
import { rxEffects } from '@rx-angular/state/effects';
import { select } from '@rx-angular/state/selections';
import { merge, switchMap, take } from 'rxjs';
import { Todo } from './todo.model';

interface Actions {
  remove: Todo;
  toggleDone: boolean;
  updateText: string;
  edit: void;
}

interface Transforms {
  toggleDone: typeof eventChecked;
  updateText: typeof eventValue;
}

interface State {
  isEditing: boolean;
  todo: Todo;
}

const eventChecked = (e: Event): boolean => {
  return (e.target as HTMLInputElement).checked;
};

@Component({
  standalone: true,
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'todo',
    '[class.completed]': 'todo.done',
    '[class.editing]': 'isEditing',
  },
  styles: `
      :host {
        display: block;
      }
  `,
  template: `
    @if (isEditing) {
    <input
      #input
      class="edit"
      [value]="todo.text"
      (blur)="actions.updateText($event)"
      (keyup.enter)="actions.updateText($event)"
    />
    } @else {
    <div class="view">
      <input
        class="toggle"
        type="checkbox"
        [checked]="todo.done"
        (input)="actions.toggleDone($event)"
      />
      <label (dblclick)="actions.edit()">{{ todo.text }}</label>
      <button class="destroy" (click)="actions.remove(todo)"></button>
    </div>
    }
  `,
})
export class TodoComponent {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly strategyProvider = inject(RxStrategyProvider);

  readonly actions = rxActions<Actions, Transforms>(({ transforms }) =>
    transforms({
      toggleDone: eventChecked,
      updateText: eventValue,
    })
  );

  readonly remove = outputFromObservable(this.actions.remove$);
  readonly update = outputFromObservable(
    merge(this.actions.toggleDone$, this.actions.updateText$).pipe(
      switchMap(() => this.state.select('todo').pipe(take(1)))
    )
  );

  private readonly state = rxState<State>(({ set, connect }) => {
    set({ isEditing: false });
    connect('todo', this.actions.toggleDone$, ({ todo }, done: boolean) => ({
      ...todo,
      done,
    }));
    connect(this.actions.updateText$, ({ todo }, text: string) => ({
      isEditing: false,
      todo: {
        ...todo,
        text,
      },
    }));
    connect('isEditing', this.actions.edit$, () => true);
  });

  private input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  @Input({ required: true })
  set todo(todo: Todo) {
    this.state.set({ todo });
  }

  get todo(): Todo {
    return this.state.get('todo');
  }

  get isEditing(): boolean {
    return this.state.get('isEditing');
  }

  constructor() {
    rxEffects(({ register }) => {
      const focusInputWhenEditing$ = this.state.$.pipe(
        select('isEditing'),
        this.strategyProvider.scheduleWith((isEditing) => {
          // eslint-disable-next-line @rx-angular/no-explicit-change-detection-apis
          this.cd.detectChanges();

          if (isEditing) {
            // eslint-disable-next-line @rx-angular/prefer-no-layout-sensitive-apis
            this.input().nativeElement.focus();
          }
        })
      );

      register(focusInputWhenEditing$);
    });
  }
}
