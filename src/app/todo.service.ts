import { Injectable } from '@angular/core';
import { insert, remove, RxState, stateful, update } from '@rx-angular/state';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { INITIAL_STATE, Todo, TodoFilter, TodoState } from './todo-state';

export const byId = (a, b) => a.id === b.id;

@Injectable()
export class TodoService extends RxState<TodoState> {
  private readonly _todos$ = this.select('todos');

  private readonly _filter$ = new Subject<{ filter: TodoFilter }>();

  readonly filter$ = this.select('filter');

  readonly todos$ = this.select().pipe(
    stateful(
      map(({ todos, filter }) =>
        todos.filter(({ done }) => {
          if (filter === 'all') return true;
          if (filter === 'active') return !done;
          if (filter === 'completed') return done;
        })
      )
    )
  );

  readonly completed$ = this._todos$.pipe(
    stateful(map((todos) => todos.filter((todo) => todo.done)))
  );

  readonly active$ = this._todos$.pipe(
    stateful(map((todos) => todos.filter((todo) => !todo.done)))
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
      todos: insert(todos, {
        id: todos.length,
        text,
        done: false,
      }),
    }));
  }

  remove(todo: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: remove(todos, todo, byId),
    }));
  }

  toggleDone({ id, done }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: update(todos, { id, done }, byId),
    }));
  }

  setText({ id, text }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: update(todos, { id, text }, byId),
    }));
  }

  toggleAll({ done }: Partial<Todo>): void {
    this.set(({ todos }) => ({
      todos: update(todos, { done }),
    }));
  }

  clearCompleted(): void {
    this.set(({ todos }) => ({
      todos: todos.filter(({ done }) => !done),
    }));
  }
}
