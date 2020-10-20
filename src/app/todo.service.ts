import { Injectable } from '@angular/core';
import {
  insert,
  remove,
  RxState,
  stateful,
  update,
} from '@rx-angular/state';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { INITIAL_STATE, Todo, TodoFilter, TodoState } from './todo-state';

@Injectable()
export class TodoService extends RxState<TodoState> {
  private readonly _insert$ = new Subject<Partial<Todo>>();
  private readonly _remove$ = new Subject<Partial<Todo>>();
  private readonly _setText$ = new Subject<Partial<Todo>>();
  private readonly _toggleDone$ = new Subject<Partial<Todo>>();
  private readonly _toggleAll$ = new Subject<Partial<Todo>>();
  private readonly _clearCompleted$ = new Subject<Partial<Todo>>();
  private readonly _filter$ = new Subject<TodoFilter>();

  private readonly _todos$ = this.select('todos');

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

  readonly all$ = this._todos$.pipe(stateful());

  readonly completed$ = this._todos$.pipe(
    stateful(map((todos) => todos.filter((todo) => todo.done)))
  );

  readonly active$ = this._todos$.pipe(
    stateful(map((todos) => todos.filter((todo) => !todo.done)))
  );

  constructor() {
    super();
    this.set(INITIAL_STATE);
    this.connect('filter', this._filter$);
    this.connect('todos', this._insert$, ({ todos }, { text }) =>
      insert(todos, { id: todos.length, text, done: false })
    );
    this.connect('todos', this._remove$, ({ todos }, { id }) =>
      remove(todos, { id }, 'id')
    );
    this.connect('todos', this._setText$, ({ todos }, { id, text }) =>
      update(todos, { id, text }, 'id')
    );
    this.connect('todos', this._toggleDone$, ({ todos }, { id, done }) =>
      update(todos, { id, done }, 'id')
    );
    this.connect('todos', this._toggleAll$, ({ todos }, { done }) =>
      update(todos, { done }, () => true)
    );
    this.connect('todos', this._clearCompleted$, ({ todos }, { done }) =>
      remove(todos, { done }, 'done')
    );
  }

  setFilter(filter: TodoFilter): void {
    this._filter$.next(filter);
  }

  insert(todo: Partial<Todo>): void {
    this._insert$.next(todo);
  }

  remove(todo: Partial<Todo>): void {
    this._remove$.next(todo);
  }

  toggleDone(todo: Partial<Todo>): void {
    this._toggleDone$.next(todo);
  }

  setText(todo: Partial<Todo>): void {
    this._setText$.next(todo);
  }

  toggleAll(todo: Partial<Todo>): void {
    this._toggleAll$.next(todo);
  }

  clearCompleted(): void {
    this._clearCompleted$.next({ done: true });
  }
}
