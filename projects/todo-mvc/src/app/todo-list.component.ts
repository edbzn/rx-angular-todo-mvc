import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RxActionFactory } from '@rx-angular/state/actions';
import { ForModule } from '@rx-angular/template/for';
import { LetModule } from '@rx-angular/template/let';
import { Todo } from './todo-state';
import { TodoComponent } from './todo.component';
import { TodoService } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForModule, ReactiveFormsModule, LetModule, TodoComponent],
  providers: [TodoService, RxActionFactory],
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
          class="new-todo"
          placeholder="What needs to be done?"
          [formControl]="input"
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
          *rxFor="let todo of vm.filteredTodos; trackBy: trackById"
          [todo]="todo"
          (change)="todoService.commands.update($event)"
          (remove)="todoService.commands.remove($event)"
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
              (click)="todoService.commands.setFilter('all')"
            >
              {{ vm.allTodos.length }} All
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'active'"
              (click)="todoService.commands.setFilter('active')"
            >
              {{ vm.activeTodos.length }} Active
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'completed'"
              (click)="todoService.commands.setFilter('completed')"
            >
              {{ vm.completedTodos.length }} Completed
            </button>
          </li>
        </ul>
        <button class="clear-completed" (click)="todoService.commands.clearCompleted()">
          Clear completed
        </button>
      </footer>
    </ng-container>
  `,
})
export class TodoListComponent {
  input = new FormControl('');

  constructor(readonly todoService: TodoService) {}

  addTodo(): void {
    const text = this.input.value.trim();
    if (text.length === 0) {
      return;
    }

    this.todoService.commands.create({ text });
    this.input.reset();
  }

  toggleAll(event: Event): void {
    this.todoService.commands.toggleAll({
      done: (event.target as HTMLInputElement).checked,
    });
  }

  trackById(i, todo: Todo) {
    return todo.id;
  }
}
