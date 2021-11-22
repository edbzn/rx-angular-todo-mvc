import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
        #checkbox
        [checked]="todoService.completed$ | async"
        (click)="toggleAll($event)"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          *ngFor="
            let todo of todoService.filteredTodos$ | async;
            trackBy: trackById
          "
          [ngClass]="{
            completed: todo.done,
            editing: todo == currentTodo
          }"
        >
          <div class="view">
            <input
              class="toggle"
              type="checkbox"
              (change)="toggle(todo)"
              [checked]="todo.done"
            />
            <label (dblclick)="edit(todo)">{{ todo.text }}</label>
            <button (click)="delete(todo)" class="destroy"></button>
          </div>
          <input
            *ngIf="currentTodo == todo"
            (keyup.enter)="update(todo)"
            (keyup.esc)="cancelEdit()"
            class="edit"
          />
        </li>
      </ul>
      <!-- <app-todo
        class="todo-list"
        *ngFor="let todo of filteredTodos; trackBy: trackById"
        [todo]="todo"
        (change)="todoService.update($event)"
        (remove)="todoService.remove($event)"
      ></app-todo> -->
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
export class TodoListComponent implements OnInit {
  @ViewChild('input')
  input: ElementRef<HTMLInputElement>;

  constructor(public todoService: TodoService) {}

  ngOnInit() {}

  addTodo() {
    const text = this.input.nativeElement.value;
    if (text.trim().length === 0) {
      return;
    }

    this.todoService.createTodo(text.trim()).subscribe(() => {
      this.input.nativeElement.value = '';
    });
  }

  toggleAll(completed: boolean) {
    this.todoService.toggleAll(completed).subscribe();
  }

  toggle(todo: Todo) {
    todo.done = !todo.done;
    this.todoService.updateTodo(todo).subscribe();
  }

  edit(todo: Todo) {
    // this.currentTodo = todo;
  }

  update(todo: Todo) {
    this.todoService.updateTodo(todo).subscribe();
  }

  delete(todo: Todo) {
    this.todoService.deleteTodo(todo.id).subscribe();
  }

  clearCompleted() {
    this.todoService.clearCompleted().subscribe();
  }

  cancelEdit() {
    // this.currentTodo = null;
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }
}
