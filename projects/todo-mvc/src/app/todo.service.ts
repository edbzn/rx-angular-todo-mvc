import { Injectable } from '@angular/core';
import { insert, remove, update } from '@rx-angular/cdk/transformations';
import { selectSlice, stateful } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { injectRxState } from './rx-state';
import { Commands, INITIAL_STATE, TodoState } from './todo-state';

const id = () => Math.round(Math.random() * 100000);

@Injectable()
export class TodoService {
  readonly #state = injectRxState<TodoState>();

  readonly #filter$ = this.#state.select('filter');

  readonly #allTodos$ = this.#state.select('todos');

  readonly #filteredTodos$ = this.#state
    .select(selectSlice(['filter', 'todos']))
    .pipe(
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
    this.#initialize();

    this.#state.connect('filter', this.commands.setFilter$);
    this.#state.connect('todos', this.commands.create$, ({ todos }, { text }) =>
      insert(todos, {
        id: id(),
        text,
        done: false,
      })
    );
    this.#state.connect('todos', this.commands.remove$, ({ todos }, { id }) =>
      remove(todos, { id }, 'id')
    );
    this.#state.connect(
      'todos',
      this.commands.update$,
      ({ todos }, { id, text, done }) => update(todos, { id, text, done }, 'id')
    );
    this.#state.connect(
      'todos',
      this.commands.toggleAll$,
      ({ todos }, { done }) => update(todos, { done }, () => true)
    );
    this.#state.connect('todos', this.commands.clearCompleted$, ({ todos }) =>
      remove(todos, { done: true }, 'done')
    );

    this.#state.hold(this.#state.select(), (state) => {
      window.localStorage.setItem('__state', JSON.stringify(state));
    });
  }

  #initialize(): void {
    if (window.localStorage.getItem('__state')) {
      this.#state.set(
        JSON.parse(window.localStorage.getItem('__state')!) as TodoState
      );
    } else {
      this.#state.set(INITIAL_STATE);
    }
  }
}
