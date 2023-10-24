import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { RxStrategyProvider } from '@rx-angular/cdk/render-strategies';
import { rxState } from '@rx-angular/state';
import { rxActions } from '@rx-angular/state/actions';
import { rxEffects } from '@rx-angular/state/effects';
import { select } from '@rx-angular/state/selections';
import { Todo } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="todo"
      [class]="{ completed: todo.done, editing: isEditing }"
    >
      @if (isEditing) {
      <input
        #input
        class="edit"
        [value]="todo.text"
        (blur)="updateText()"
        (keyup.enter)="updateText()"
      />
      } @else {
      <div class="view">
        <input
          #toggle
          class="toggle"
          type="checkbox"
          [checked]="todo.done"
          (input)="toggleDone()"
        />
        <label (dblclick)="edit()">{{ todo.text }}</label>
        <button class="destroy" (click)="destroy()"></button>
      </div>
      }
    </article>
  `,
})
export class TodoComponent {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly strategyProvider = inject(RxStrategyProvider);
  private readonly state = rxState<{ isEditing: boolean; todo: Todo }>(
    ({ set }) => set({ isEditing: false })
  );
  private readonly actions = rxActions<{ remove: Todo; update: Todo }>();

  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle?: ElementRef<HTMLInputElement>;

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

  @Output() remove = this.actions.remove$;
  @Output() update = this.actions.update$;

  constructor() {
    rxEffects(({ register }) => {
      const focusInputWhenEditing$ = this.state.$.pipe(
        select('isEditing'),
        this.strategyProvider.scheduleWith((isEditing) => {
          // eslint-disable-next-line @rx-angular/no-explicit-change-detection-apis
          this.cd.detectChanges();

          if (isEditing) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @rx-angular/prefer-no-layout-sensitive-apis
            this.input!.nativeElement.focus();
          }
        })
      );

      register(focusInputWhenEditing$);
    });
  }

  toggleDone(): void {
    this.state.set(({ todo }) => ({
      todo: {
        ...todo,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        done: this.toggle!.nativeElement.checked,
      },
    }));
    this.actions.update(this.todo);
  }

  edit(): void {
    this.state.set({ isEditing: true });
  }

  destroy(): void {
    this.actions.remove(this.todo);
  }

  updateText(): void {
    this.state.set(({ todo }) => ({
      isEditing: false,
      todo: {
        ...todo,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        text: this.input!.nativeElement.value,
      },
    }));
    this.actions.update(this.todo);
  }
}
