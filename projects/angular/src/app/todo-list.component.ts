import { Component, ElementRef, ViewChild } from '@angular/core';

import { Todo } from './todo-state';
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
        (keyup.enter)="addTodo()"
      />
    </header>
    <section class="main">
      <input
        class="toggle-all"
        id="toggle-all"
        type="checkbox"
        (click)="toggleAll($event)"
      />
      <label for="toggle-all">Mark all as complete</label>
      <app-todo
        class="todo-list"
        *ngFor="
          let todo of todoService.filteredTodos$ | async;
          trackBy: trackById
        "
        [todo]="todo"
        (change)="todoService.update($event)"
        (remove)="todoService.remove($event)"
      ></app-todo>
    </section>
    <footer class="footer">
      <span class="todo-count">
        <strong>{{ (todoService.active$ | async)?.length }}</strong> item left
      </span>
      <ul class="filters" *ngIf="todoService.filter$ | async as filter">
        <li>
          <button
            (click)="todoService.setFilter('all')"
            [class.selected]="filter === 'all'"
          >
            {{ (todoService.allTodos$ | async)?.length }} All
          </button>
        </li>
        <li>
          <button
            (click)="todoService.setFilter('active')"
            [class.selected]="filter === 'active'"
          >
            {{ (todoService.activeTodos$ | async)?.length }} Active
          </button>
        </li>
        <li>
          <button
            (click)="todoService.setFilter('completed')"
            [class.selected]="filter === 'completed'"
          >
            {{ (todoService.completedTodos$ | async)?.length }} Completed
          </button>
        </li>
      </ul>
      <button class="clear-completed" (click)="clearCompleted()">
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
  @ViewChild('input')
  input: ElementRef<HTMLInputElement>;

  constructor(public todoService: TodoService) {}

  addTodo() {
    const text = this.input.nativeElement.value.trim();
    if (text.length === 0) {
      return;
    }

    this.todoService.create({ text }).subscribe(() => {
      this.input.nativeElement.value = '';
    });
  }

  toggleAll(event: Event) {
    this.todoService
      .toggleAll({
        done: (event.target as HTMLInputElement).checked,
      })
      .subscribe();
  }

  update(todo: Todo) {
    this.todoService.update(todo).subscribe();
  }

  delete(todo: Todo) {
    this.todoService.remove({ id: todo.id }).subscribe();
  }

  clearCompleted() {
    this.todoService.clearCompleted().subscribe();
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }
}
