import { Component, ElementRef, ViewChild } from '@angular/core';
import { Todo } from './todo-state';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo-list',
  host: {
    class: 'todo-app',
  },
  template: `
    <ng-container *rxLet="todoService.vm$ as vm">
      <header class="header">
        <h1>Todo</h1>
        <input
          class="new-todo"
          placeholder="What needs to be done?"
          (keyup)="insert($event)"
        />
      </header>
      <section class="main">
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          (input)="toggleAll($event)"
        />
        <label for="toggle-all">Mark all as complete</label>
        <app-todo
          class="todo-list"
          *ngFor="let todo of vm.filteredTodos; trackBy: trackById"
          [todo]="todo"
          (change)="todoService.update($event)"
          (remove)="todoService.remove($event)"
        ></app-todo>
      </section>
      <footer class="footer">
        <span class="todo-count">
          <strong>{{ vm.activeTodos.length }}</strong> item left
        </span>
        <ul class="filters">
          <li>
            <button
              [class.selected]="vm.filter === 'all'"
              (click)="todoService.setFilter('all')"
            >
              {{ vm.allTodos.length }} All
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'active'"
              (click)="todoService.setFilter('active')"
            >
              {{ vm.activeTodos.length }} Active
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'completed'"
              (click)="todoService.setFilter('completed')"
            >
              {{ vm.completedTodos.length }} Completed
            </button>
          </li>
        </ul>
        <button class="clear-completed" (click)="todoService.clearCompleted()">
          Clear completed
        </button>
      </footer>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  providers: [TodoService],
})
export class TodoListComponent {
  @ViewChild('input')
  input: ElementRef<HTMLInputElement>;

  constructor(public readonly todoService: TodoService) {}

  addTodo(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.todoService.insert({ text: this.input.nativeElement.value.trim() });
      this.input.nativeElement.value = '';
    }
  }

  toggleAll(event: Event): void {
    this.todoService.toggleAll({
      done: (event.target as HTMLInputElement).checked,
    });
  }

  trackById(i, todo: Todo) {
    return todo.id;
  }
}
