import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RxLet } from '@rx-angular/template/let';
import { TodoService } from './todo-list.service';
import { TodoComponent } from './todo.component';

@Component({
  standalone: true,
  selector: 'app-todo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RxLet, TodoComponent, CdkDropList, CdkDrag],
  providers: [TodoService],
  styles: `
      :host {
        display: block;
      }
    `,
  template: `
    <header class="header">
      <h1>Todo</h1>
      <input
        data-uf="new-todo"
        class="new-todo"
        placeholder="What needs to be done?"
        [formControl]="input"
        (keyup.enter)="todoService.actions.create({ text: $event, callback: resetInput })"
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
      <section
        class="todo-list"
        *rxLet="todoService.filteredTodos$; let todos"
        cdkDropList
        cdkDropListLockAxis="y"
        [cdkDropListData]="todos"
        (cdkDropListDropped)="todoService.actions.drop($event)"
      >
        @for (todo of todos; track todo.id; let i = $index) {
          <app-todo
            cdkDrag
            [attr.data-uf]="'todo-' + i"
            [todo]="todo"
            (update)="todoService.actions.update($event)"
            (remove)="todoService.actions.remove($event)"
          />
        } @empty {
          <div class="no-todo">Nothing to see.</div>
        }
      </section>
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
  @HostBinding('class.todo-app') readonly todoApp = true;

  readonly input = new FormControl('');
  readonly todoService = inject(TodoService);
  readonly resetInput = () => this.input.reset();
}
