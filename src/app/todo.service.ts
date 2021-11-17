import { Injectable } from '@angular/core';
import { insert, remove, RxState, selectSlice, update } from '@rx-angular/state';
import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { INITIAL_STATE, Todo, TodoFilter, TodoState } from './todo-state';

@Injectable()
export class TodoService extends RxState<TodoState> {
  /**
   * Actions
   */
  private readonly _insert$ = new Subject<Partial<Todo>>();
  private readonly _remove$ = new Subject<Partial<Todo>>();
  private readonly _setText$ = new Subject<Partial<Todo>>();
  private readonly _toggleDone$ = new Subject<Partial<Todo>>();
  private readonly _toggleAll$ = new Subject<Partial<Todo>>();
  private readonly _clearCompleted$ = new Subject<Partial<Todo>>();
  private readonly _setFilter$ = new Subject<TodoFilter>();

  /**
   * State
   */
  private readonly _filter$ = this.select('filter');
  private readonly _allTodos$ = this.select('todos');

  /**
   * Derived state
   */
  private readonly _filteredTodos$ = this.select(
    selectSlice(['filter', 'todos'])
  ).pipe(
    map(({ todos, filter }) =>
      todos.filter(({ done }) => {
        if (filter === 'all') return true;
        if (filter === 'active') return !done;
        if (filter === 'completed') return done;
      })
    )
  );
  private readonly _completedTodos$ = this._allTodos$.pipe(
    map((todos) => todos.filter((todo) => todo.done))
  );
  private readonly _activeTodos$ = this._allTodos$.pipe(
    map((todos) => todos.filter((todo) => !todo.done))
  );

  /**
   * Exposed view model
   */
  readonly vm$ = combineLatest({
    filter: this._filter$,
    allTodos: this._allTodos$,
    activeTodos: this._activeTodos$,
    filteredTodos: this._filteredTodos$,
    completedTodos: this._completedTodos$,
  });

  constructor() {
    super();
    this._initialize();

    /**
     * Action handlers
     */
    this.connect('filter', this._setFilter$);
    this.connect('todos', this._insert$, ({ todos }, { text }) =>
      insert(todos, { id: Math.round(Math.random() * 100000), text, done: false })
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

    /**
     * Side effect handler
     */
    this.hold(this.select(), (state) => {
      window.localStorage.setItem('__state', JSON.stringify(state));
    });
  }

  /**
   * Exposed actions
   */
  setFilter(filter: TodoFilter): void {
    this._setFilter$.next(filter);
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

  private _initialize(): void {
    if (window.localStorage.getItem('__state')) {
      this.set(JSON.parse(window.localStorage.getItem('__state')) as TodoState)
    } else {
      this.set(INITIAL_STATE);
    }
  }
}
