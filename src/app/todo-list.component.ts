import { Component, ElementRef, ViewChild } from '@angular/core';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-todo-list',
  host: {
    class: 'todo-app',
  },
  template: `
    <ng-container *rxLet="todoService.vm$; let vm">
      <header class="header">
        <h1>Todo</h1>
        <input
          #input
          class="new-todo"
          placeholder="What needs to be done?"
          (keyup)="insert($event)"
        />
      </header>
      <section class="main">
        <input
          id="toggle-all"
          #checkbox
          class="toggle-all"
          type="checkbox"
          (input)="toggleAll($event)"
        />
        <label for="toggle-all">Mark all as complete</label>
        <app-todo
          class="todo-list"
          *ngFor="let todo of vm.filteredTodos"
          [todo]="todo"
          (textUpdate)="todoService.setText($event)"
          (done)="todoService.toggleDone($event)"
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
  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;
  @ViewChild('checkbox', { static: false })
  checkbox: ElementRef<HTMLInputElement>;

  constructor(public readonly todoService: TodoService) {}

  insert(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.todoService.insert({ text: this.input.nativeElement.value });
      this.input.nativeElement.value = '';
    }
  }

  toggleAll(event: Event): void {
    this.todoService.toggleAll({ done: (event.target as any).checked });
  }
}
