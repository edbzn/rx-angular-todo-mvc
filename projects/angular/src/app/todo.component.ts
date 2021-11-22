import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { Todo } from './todo-state';

@Component({
  selector: 'app-todo',
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
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('toggle') toggle: ElementRef<HTMLInputElement>;

  @Input() todo: Todo;

  @Output() remove = new EventEmitter<Pick<Todo, 'id'>>();
  @Output() change = new EventEmitter<Pick<Todo, 'id' | 'text' | 'done'>>();

  isEditing = false;

  toggleDone(): void {
    this.change.emit({
      ...this.todo,
      done: this.toggle.nativeElement.checked,
    });
  }

  edit(): void {
    this.isEditing = true;
    setTimeout(() => this.input.nativeElement.focus());
  }

  destroy(): void {
    this.remove.emit(this.todo);
  }

  updateText(): void {
    this.isEditing = false;
    this.change.emit({
      ...this.todo,
      text: this.input.nativeElement.value,
    });
  }
}
