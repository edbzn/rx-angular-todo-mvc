import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { RxState } from '@rx-angular/state';
import { IfModule } from '@rx-angular/template/if';
import { LetModule } from '@rx-angular/template/let';
import { asyncScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { Todo } from './todo-state';

@Component({
  standalone: true,
  selector: 'app-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IfModule, LetModule],
  providers: [RxState],
  template: `
    <article
      class="todo"
      *rxLet="vm$ as vm"
      [class]="{ completed: vm.todo.done, editing: vm.isEditing }"
    >
      <div class="view" *rxIf="!vm.isEditing">
        <input
          #toggle
          class="toggle"
          type="checkbox"
          [checked]="vm.todo.done"
          (input)="toggleDone()"
        />
        <label (dblclick)="edit()">{{ vm.todo.text }}</label>
        <button class="destroy" (click)="destroy()"></button>
      </div>
      <input
        #input
        class="edit"
        *rxIf="vm.isEditing"
        [value]="vm.todo.text"
        (blur)="updateText()"
        (keyup.enter)="updateText()"
      />
    </article>
  `,
})
export class TodoComponent {
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle?: ElementRef<HTMLInputElement>;

  @Input() set todo(todo: Todo) {
    this.state.set({ todo });
  }

  get todo(): Todo {
    return this.state.get('todo');
  }

  @Output() remove = new EventEmitter<Pick<Todo, 'id'>>();
  @Output() change = new EventEmitter<Todo>();

  readonly vm$ = this.state.select();

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly state: RxState<{ isEditing: boolean; todo: Todo }>
  ) {
    this.state.set({ isEditing: false });

    const isEditing$ = this.state
      .select('isEditing')
      .pipe(filter(Boolean), observeOn(asyncScheduler));

    this.state.hold(isEditing$, () => {
      if (this.input == null) {
        this.cd.detectChanges();
      }

      this.input!.nativeElement.focus();
    });
  }

  toggleDone(): void {
    this.state.set(({ todo }) => ({
      todo: {
        ...todo,
        done: this.toggle!.nativeElement.checked,
      },
    }));
    this.change.emit(this.todo);
  }

  edit(): void {
    this.state.set({ isEditing: true });
  }

  destroy(): void {
    this.remove.emit(this.todo);
  }

  updateText(): void {
    this.state.set(({ todo }) => ({
      isEditing: false,
      todo: {
        ...todo,
        text: this.input!.nativeElement.value,
      },
    }));
    this.change.emit(this.todo);
  }
}
