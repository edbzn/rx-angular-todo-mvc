import { Injectable } from '@angular/core';
import { selectResult } from '@ngneat/query';
import { insert, remove, update } from '@rx-angular/cdk/transformations';
import { selectSlice, stateful } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { injectRxState } from './rx-state';
import { TodoResource } from './todo.resource';

const id = () => Math.round(Math.random() * 100000);

export type TodoFilter = 'all' | 'completed' | 'active';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

export interface Commands {
  create: Pick<Todo, 'text'>;
  remove: Pick<Todo, 'id'>;
  update: Pick<Todo, 'id' | 'text' | 'done'>;
  toggleAll: Pick<Todo, 'done'>;
  clearCompleted: Pick<Todo, 'done'>;
  setFilter: TodoFilter;
}

export const INITIAL_STATE: TodoState = {
  filter: 'all',
  todos: [],
};

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

  constructor(
    private readonly factory: RxActionFactory<Commands>,
    private readonly todoResource: TodoResource
  ) {
    this.#state.set(INITIAL_STATE);
    this.#state.connect(
      'todos',
      this.todoResource
        .getAll()
        .result$.pipe(selectResult((result) => result.data ?? []))
    );
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
}
