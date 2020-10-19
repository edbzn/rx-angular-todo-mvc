import { Injectable } from '@angular/core';
import { RxState, stateful } from '@rx-angular/state';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { INITIAL_STATE, Todo, TodoFilter, TodoState } from './todo-state';

@Injectable()
export class TodoService extends RxState<TodoState> {
  private readonly _todos$ = this.select('todos');

  private readonly _filter$ = new Subject<{ filter: TodoFilter }>();

  readonly todos$ = this.select().pipe(
    stateful(),
    map(({ todos, filter }) =>
      todos.filter(({ done }) => {
        if (filter === 'all') return true;
        if (filter === 'active') return !done;
        if (filter === 'completed') return done;
      })
    )
  );

  readonly filter$ = this.select('filter');

  readonly completed$ = this._todos$.pipe(
    stateful(),
    map((todos) => todos.filter((todo) => todo.done))
  );

  readonly active$ = this._todos$.pipe(
    stateful(),
    map((todos) => todos.filter((todo) => !todo.done))
  );

  constructor() {
    super();
    this.connect(this._filter$);
    this.set(INITIAL_STATE);
  }

  setFilter(filter: TodoFilter): void {
    this._filter$.next({ filter });
  }

  add({ text }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: [
        {
          id: todos.length,
          text,
          done: false,
        },
        ...todos,
      ],
    }));
  }

  remove({ id }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: todos.filter((todo) => id !== todo.id),
    }));
  }

  toggleDone({ id, done }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: todos.map((todo) => (id === todo.id ? { ...todo, done } : todo)),
    }));
  }

  setText({ id, text }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: todos.map((todo) => (id === todo.id ? { ...todo, text } : todo)),
    }));
  }

  toggleAll({ done }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: todos.map((todo) => ({ ...todo, done })),
    }));
  }

  clearCompleted(): void {
    this.set(({ todos }) => ({
      todos: todos.filter(({ done }) => !done),
    }));
  }
}
