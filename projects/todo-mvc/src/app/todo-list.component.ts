import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ForModule } from '@rx-angular/template/for';
import { LetModule } from '@rx-angular/template/let';
import { SuspenseComponent } from './suspense.component';
import { TodoComponent } from './todo.component';
import { Todo, TodoService } from './todo.service';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ForModule,
    ReactiveFormsModule,
    LetModule,
    TodoComponent,
    SuspenseComponent,
  ],
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
      <!-- Todos -->
      <app-suspense [data$]="todoService.filteredTodos$">
        <ng-template #data let-todos>
          <app-todo
            class="todo-list"
            *rxFor="let todo of todos; trackBy: trackById; let i = index"
            [attr.data-uf]="'todo-' + i"
            [todo]="todo"
            (change)="todoService.actions.update($event)"
            (remove)="todoService.actions.remove($event)"
          ></app-todo>
        </ng-template>
      </app-suspense>
    </section>
    <footer class="footer" *rxLet="todoService.filter$; let filter">
      <span class="todo-count">
        <strong *rxLet="todoService.activeTodos$; let activeTodos">{{
          activeTodos.length
        }}</strong>
        item left
      </span>
      <ul class="filters">
        <li>
          <button
            *rxLet="todoService.allTodos$; let allTodos"
            [class.selected]="filter === 'all'"
            (click)="todoService.actions.setFilter('all')"
          >
            {{ allTodos.length }} All
          </button>
        </li>
        <li>
          <button
            *rxLet="todoService.activeTodos$; let activeTodos"
            [class.selected]="filter === 'active'"
            (click)="todoService.actions.setFilter('active')"
          >
            {{ activeTodos.length }} Active
          </button>
        </li>
        <li>
          <button
            *rxLet="todoService.completedTodos$; let completedTodos"
            [class.selected]="filter === 'completed'"
            (click)="todoService.actions.setFilter('completed')"
          >
            {{ completedTodos.length }} Completed
          </button>
        </li>
      </ul>
      <button
        class="clear-completed"
        (click)="todoService.actions.clearCompleted()"
      >
        Clear completed
      </button>
    </footer>
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
