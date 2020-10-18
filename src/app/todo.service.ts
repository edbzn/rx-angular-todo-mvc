import { Injectable } from '@angular/core';
import { RxState, stateful } from '@rx-angular/state';
import { combineLatest } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { map } from 'rxjs/operators';
import { Todo, TodoState } from './todo-state';

export type TodoFilter = 'all' | 'completed' | 'active';

@Injectable({
  providedIn: 'root',
})
export class TodoService extends RxState<TodoState> {
  private readonly _todos$ = this.select('todos');

  private readonly _filter$ = new BehaviorSubject<TodoFilter>('all');

  get filter() {
    return this._filter$.value;
  }

  readonly todos$ = combineLatest([this._todos$, this._filter$]).pipe(
    stateful(),
    map(([todos, filter]) =>
      todos.filter(({ done }) => {
        if (filter === 'all') return true;
        if (filter === 'active') return !done;
        if (filter === 'completed') return done;
      })
    )
  );

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
    this.set({
      todos: [{ id: 0, text: 'Hello world.', done: false }],
    });
  }

  setFilter(filter: TodoFilter): void {
    this._filter$.next(filter);
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

  toggleAll(done: boolean): void {
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
