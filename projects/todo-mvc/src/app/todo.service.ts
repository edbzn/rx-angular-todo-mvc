import { Injectable } from '@angular/core';
import { insert, remove, update } from '@rx-angular/cdk/transformations';
import { RxState, selectSlice, stateful } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { INITIAL_STATE, Todo, TodoFilter, TodoState } from './todo-state';

interface Commands {
  create: Pick<Todo, 'text'>;
  remove: Pick<Todo, 'id'>;
  update: Pick<Todo, 'id' | 'text' | 'done'>;
  toggleAll: Pick<Todo, 'done'>;
  clearCompleted: Pick<Todo, 'done'>;
  setFilter: TodoFilter;
}

@Injectable()
export class TodoService extends RxState<TodoState> {
  /**
   * UI actions
   */
  private readonly commands = this.factory.create();

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
  }).pipe(stateful());

  constructor(private readonly factory: RxActionFactory<Commands>) {
    super();
    this._initialize();

    /**
     * State handlers
     */
    this.connect('filter', this.commands.setFilter$);
    this.connect('todos', this.commands.create$, ({ todos }, { text }) =>
      insert(todos, {
        id: Math.round(Math.random() * 100000),
        text,
        done: false,
      })
    );
    this.connect('todos', this.commands.remove$, ({ todos }, { id }) =>
      remove(todos, { id }, 'id')
    );
    this.connect(
      'todos',
      this.commands.update$,
      ({ todos }, { id, text, done }) => update(todos, { id, text, done }, 'id')
    );
    this.connect('todos', this.commands.toggleAll$, ({ todos }, { done }) =>
      update(todos, { done }, () => true)
    );
    this.connect(
      'todos',
      this.commands.clearCompleted$,
      ({ todos }, { done }) => remove(todos, { done }, 'done')
    );

    /**
     * Side effects handlers
     */
    this.hold(this.select(), (state) => {
      window.localStorage.setItem('__state', JSON.stringify(state));
    });
  }

  setFilter(filter: TodoFilter): void {
    this.commands.setFilter(filter);
  }

  create(todo: Pick<Todo, 'text'>): void {
    this.commands.create(todo);
  }

  remove(todo: Pick<Todo, 'id'>): void {
    this.commands.remove(todo);
  }

  update(todo: Todo): void {
    this.commands.update(todo);
  }

  toggleAll(todo: Pick<Todo, 'done'>): void {
    this.commands.toggleAll(todo);
  }

  clearCompleted(): void {
    this.commands.clearCompleted({ done: true });
  }

  private _initialize(): void {
    if (window.localStorage.getItem('__state')) {
      this.set(JSON.parse(window.localStorage.getItem('__state')) as TodoState);
    } else {
      this.set(INITIAL_STATE);
    }
  }
}
