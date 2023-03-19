import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ForModule } from '@rx-angular/template/for';
import { LetModule } from '@rx-angular/template/let';
import { TodoComponent } from './todo.component';
import { Todo, TodoService } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForModule, ReactiveFormsModule, LetModule, TodoComponent],
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
          data-uf="new-todo"
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
          (click)="todoService.actions.toggleAll()"
        />
        <label for="toggle-all">Mark all as complete</label>
        <app-todo
          class="todo-list"
          *rxFor="let todo of todoService.filteredTodos$; trackBy: trackById; let i = index"
          [attr.data-uf]="'todo-' + i"
          [todo]="todo"
          (change)="todoService.actions.update($event)"
          (remove)="todoService.actions.remove($event)"
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
              (click)="todoService.actions.setFilter('all')"
            >
              {{ vm.allTodos.length }} All
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'active'"
              (click)="todoService.actions.setFilter('active')"
            >
              {{ vm.activeTodos.length }} Active
            </button>
          </li>
          <li>
            <button
              [class.selected]="vm.filter === 'completed'"
              (click)="todoService.actions.setFilter('completed')"
            >
              {{ vm.completedTodos.length }} Completed
            </button>
          </li>
        </ul>
        <button class="clear-completed" (click)="todoService.actions.clearCompleted()">
          Clear completed
        </button>
      </footer>
    </ng-container>
  `,
})
export class TodoListComponent {
  readonly input = new FormControl('');

  constructor(readonly todoService: TodoService) {}

  addTodo(): void {
    const text = (this.input.value ?? '').trim();
    if (text.length === 0) {
      return;
    }

    this.todoService.actions.create({ text });
    this.input.reset();
  }

  trackById(index: number, todo: Todo) {
    return todo.id;
  }
}
