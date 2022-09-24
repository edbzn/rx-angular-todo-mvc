import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { LetModule } from '@rx-angular/template/let';
import { Todo } from './todo-state';
import { TodoComponent } from './todo.component';
import { TodoService } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LetModule, TodoComponent],
  providers: [TodoService],
  host: {
    class: 'todo-app',
  },
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  template: `
    <ng-container *rxLet="todoService.vm$ as vm">
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
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          (click)="toggleAll($event)"
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
})
export class TodoListComponent {
  @ViewChild('input')
  input: ElementRef<HTMLInputElement>;

  constructor(public readonly todoService: TodoService) {}

  addTodo(): void {
    const text = this.input.nativeElement.value.trim();
    if (text.length === 0) {
      return;
    }

    this.todoService.create({ text });
    this.input.nativeElement.value = '';
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
