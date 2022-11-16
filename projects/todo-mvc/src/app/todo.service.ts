import { Injectable } from '@angular/core';
import { insert, remove, update } from '@rx-angular/cdk/transformations';
import { RxState, selectSlice, stateful } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Commands, INITIAL_STATE, TodoState } from './todo-state';

@Injectable()
export class TodoService extends RxState<TodoState> {
  readonly #filter$ = this.select('filter');

  readonly #allTodos$ = this.select('todos');

  readonly #filteredTodos$ = this.select(selectSlice(['filter', 'todos'])).pipe(
    map(({ todos, filter }) =>
      todos.filter(({ done }) => {
        if (filter === 'all') return true;
        if (filter === 'active') return !done;
        if (filter === 'completed') return done;
      })
    )
  );

  readonly #completedTodos$ = this.#allTodos$.pipe(
    map((todos) => todos.filter((todo) => todo.done))
  );

  readonly #activeTodos$ = this.#allTodos$.pipe(
    map((todos) => todos.filter((todo) => !todo.done))
  );

  readonly commands = this.factory.create();

  readonly vm$ = combineLatest({
    filter: this.#filter$,
    allTodos: this.#allTodos$,
    activeTodos: this.#activeTodos$,
    filteredTodos: this.#filteredTodos$,
    completedTodos: this.#completedTodos$,
  }).pipe(stateful());

  constructor(private readonly factory: RxActionFactory<Commands>) {
    super();

    this._initialize();

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
    this.connect('todos', this.commands.clearCompleted$, ({ todos }) =>
      remove(todos, { done: true }, 'done')
    );

    this.hold(this.select(), (state) => {
      window.localStorage.setItem('__state', JSON.stringify(state));
    });
  }

  private _initialize(): void {
    if (window.localStorage.getItem('__state')) {
      this.set(
        JSON.parse(window.localStorage.getItem('__state')!) as TodoState
      );
    } else {
      this.set(INITIAL_STATE);
    }
  }
}
