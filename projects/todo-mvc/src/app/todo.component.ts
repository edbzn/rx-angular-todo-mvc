import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { RxStrategyProvider } from '@rx-angular/cdk/render-strategies';
import { RxState } from '@rx-angular/state';
import { select } from '@rx-angular/state/selections';
import { RxLet } from '@rx-angular/template/let';
import { injectRxActionFactory, injectRxState } from './inject-functions';
import { Todo } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, RxLet],
  providers: [RxState],
  template: `
    <article
      class="todo"
      [class]="{ completed: todo.done, editing: isEditing }"
    >
      <div class="view" *ngIf="!isEditing">
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
      <input
        #input
        class="edit"
        *ngIf="isEditing"
        [value]="todo.text"
        (blur)="updateText()"
        (keyup.enter)="updateText()"
      />
    </article>
  `,
})
export class TodoComponent {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly state = injectRxState<{ isEditing: boolean; todo: Todo }>();
  private readonly strategyProvider = inject(RxStrategyProvider);
  private readonly actions = injectRxActionFactory<{
    remove: Pick<Todo, 'id'>;
    change: Todo;
  }>().create();

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
  @Output() change = this.actions.change$;

  constructor() {
    this.state.set({ isEditing: false });

    const isEditing$ = this.state.$.pipe(
      select('isEditing'),
      this.strategyProvider.scheduleWith((isEditing) => {
        this.cd.detectChanges();

        if (isEditing) {
          this.input!.nativeElement.focus();
        }
      })
    );

    this.state.hold(isEditing$);
  }

  toggleDone(): void {
    this.state.set(({ todo }) => ({
      todo: {
        ...todo,
        done: this.toggle!.nativeElement.checked,
      },
    }));
    this.actions.change(this.todo);
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
        text: this.input!.nativeElement.value,
      },
    }));
    this.actions.change(this.todo);
  }
}
