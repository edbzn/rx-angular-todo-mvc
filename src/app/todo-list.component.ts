import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { map } from 'rxjs/operators';
import { TodoState } from './todo-state';

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
    <section *rxLet="todos$; let todos" class="main">
      <input id="toggle-all" class="toggle-all" type="checkbox" />
      <label for="toggle-all">Mark all as complete</label>
      <app-todo
        class="todo-list"
        *ngFor="let todo of todos; let i = index"
        [todo]="todo"
        (textUpdate)="setText($event, i)"
        (done)="toggleDone($event, i)"
        (remove)="remove(i)"
      ></app-todo>
    </section>
    <footer class="footer">
      <span class="todo-count" *rxLet="active$; let active">
        <strong>{{ active }}</strong> item left
      </span>
      <ul class="filters">
        <li *rxLet="all$; let all">
          <a href="#/all">{{ all }} All</a>
        </li>
        <li *rxLet="active$; let active">
          <a href="#/active">{{ active }} Active</a>
        </li>
        <li *rxLet="completed$; let completed">
          <a href="#/completed">{{ completed }} Completed</a>
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
  providers: [RxState],
})
export class TodoListComponent implements OnInit {
  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;

  readonly todos$ = this.state.select('todos');

  readonly all$ = this.todos$.pipe(map((todos) => todos.length));

  readonly completed$ = this.todos$.pipe(
    map((todos) => todos.filter((todo) => todo.done).length)
  );

  readonly active$ = this.todos$.pipe(
    map((todos) => todos.filter((todo) => !todo.done).length)
  );

  constructor(private readonly state: RxState<TodoState>) {}

  ngOnInit(): void {
    this.state.set({
      todos: [{ id: 0, text: 'hello world', done: false }],
    });
  }

  add(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.state.set(({ todos }) => ({
        todos: [
          {
            id: todos.length,
            text: this.input.nativeElement.value,
            done: false,
          },
          ...todos,
        ],
      }));
      this.input.nativeElement.value = ''
    }
  }

  remove(index: number): void {
    this.state.set(({ todos }) => ({
      todos: todos.filter((_, i) => i !== index),
    }));
  }

  toggleDone(done: boolean, index: number): void {
    this.state.set(({ todos }) => ({
      todos: todos.map((todo, i) => (i === index ? { ...todo, done } : todo)),
    }));
  }

  setText(text: string, index: number): void {
    this.state.set(({ todos }) => ({
      todos: todos.map((todo, i) => (i === index ? { ...todo, text } : todo)),
    }));
  }

  clearCompleted() {
    this.state.set(({ todos }) => ({
      todos: todos.filter((todo) => !todo.done),
    }));
  }
}
