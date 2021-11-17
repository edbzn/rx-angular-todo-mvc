import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { RxState } from '@rx-angular/state';
import { asyncScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { Todo } from './todo-state';

@Component({
  selector: 'app-todo',
  template: `
    <article
      class="todo"
      *rxLet="vm$; let vm"
      [class]="{ completed: vm.todo.done, editing: vm.isEditing }"
    >
      <div class="view" *ngIf="!vm.isEditing">
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
        [hidden]="!vm.isEditing"
        [value]="vm.todo.text"
        (blur)="updateText()"
        (keyup)="onEnter($event)"
      />
    </article>
  `,
  providers: [RxState],
})
export class TodoComponent {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle: ElementRef<HTMLInputElement>;

  @Input() set todo(todo: Todo) {
    this.state.set({ todo });
  }

  get todo(): Todo {
    return this.state.get('todo');
  }

  @Output() remove = new EventEmitter<{ id: number }>();
  @Output() done = new EventEmitter<{ id: number; done: boolean }>();
  @Output() textUpdate = new EventEmitter<{ id: number; text: string }>();

  readonly vm$ = this.state.select();

  constructor(
    private readonly state: RxState<{ isEditing: boolean; todo: Todo }>
  ) {
    this.state.set({ isEditing: false });

    const isEditing$ = this.state
      .select('isEditing')
      .pipe(filter(Boolean), observeOn(asyncScheduler));

    this.state.hold(isEditing$, () => {
      this.input.nativeElement.focus();
    });
  }

  toggleDone(): void {
    this.done.emit({
      id: this.todo.id,
      done: this.toggle.nativeElement.checked,
    });
  }

  edit(): void {
    this.state.set({ isEditing: true });
  }

  destroy(): void {
    this.remove.emit(this.todo);
  }

  updateText(): void {
    const { value } = this.input.nativeElement;
    this.textUpdate.emit({ id: this.todo.id, text: value });
    this.state.set({ isEditing: false });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.updateText();
    }
  }
}
