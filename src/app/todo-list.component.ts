import { Component, ElementRef, ViewChild } from '@angular/core';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo-list',
  host: {
    class: 'todo-app',
  },
  template: `
    <header class="header">
      <h1>Todo</h1>
      <input
        #input
        class="new-todo"
        placeholder="What needs to be done?"
        (keyup)="add($event)"
      />
    </header>
    <section class="main" *rxLet="todoService.todos$; let todos">
      <input id="toggle-all" class="toggle-all" type="checkbox" />
      <label for="toggle-all">Mark all as complete</label>
      <app-todo
        class="todo-list"
        *ngFor="let todo of todos"
        [todo]="todo"
        (textUpdate)="todoService.setText($event)"
        (done)="todoService.toggleDone($event)"
        (remove)="todoService.remove($event)"
      ></app-todo>
    </section>
    <footer class="footer">
      <span class="todo-count">
        <strong>{{ (todoService.active$ | push)?.length }}</strong> item left
      </span>
      <ul class="filters">
        <li>
          <button
            [class.selected]="todoService.filter === 'all'"
            (click)="todoService.setFilter('all')"
          >
            {{ (todoService.todos$ | push)?.length }} All
          </button>
        </li>
        <li>
          <button
            [class.selected]="todoService.filter === 'active'"
            (click)="todoService.setFilter('active')"
          >
            {{ (todoService.active$ | push)?.length }} Active
          </button>
        </li>
        <li>
          <button
            [class.selected]="todoService.filter === 'completed'"
            (click)="todoService.setFilter('completed')"
          >
            {{ (todoService.completed$ | push)?.length }} Completed
          </button>
        </li>
      </ul>
      <button class="clear-completed" (click)="todoService.clearCompleted()">
        Clear completed
      </button>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TodoListComponent {
  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;

  constructor(readonly todoService: TodoService) {}

  add(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.todoService.add({ text: this.input.nativeElement.value });
      this.input.nativeElement.value = '';
    }
  }
}
