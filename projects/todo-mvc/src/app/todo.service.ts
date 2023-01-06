import { Injectable } from '@angular/core';
import { selectSlice, stateful } from '@rx-angular/state';
import { RxActionFactory } from '@rx-angular/state/actions';
import { combineLatest, forkJoin } from 'rxjs';
import { exhaustMap, map, withLatestFrom } from 'rxjs/operators';

import { injectRxState } from './rx-state';
import { TodoResource } from './todo.resource';

export type TodoFilter = 'all' | 'completed' | 'active';

export interface Todo {
  id: string;
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
  toggleAll: void;
  clearCompleted: void;
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
      this.todoResource.getAll()
    );
    this.#state.connect('filter', this.commands.setFilter$);
    this.#state.connect(
      'todos',
      this.commands.create$.pipe(
        exhaustMap((todo) => this.todoResource.create(todo))
      )
    );
    this.#state.connect(
      'todos',
      this.commands.remove$.pipe(
        exhaustMap((todo) => this.todoResource.remove(todo))
      )
    );
    this.#state.connect(
      'todos',
      this.commands.update$.pipe(
        exhaustMap((todo) => this.todoResource.update(todo))
      )
    );
    this.#state.connect(
      'todos',
      this.commands.toggleAll$.pipe(
        withLatestFrom(this.#allTodos$),
        exhaustMap(([, todos]) =>
          forkJoin(
            todos.map((todo) =>
              this.todoResource.update({
                ...todo,
                done: todos.every(({ done }) => !done),
              })
            )
          )
        ),
        map((todos) => todos.pop() ?? [])
      )
    );
    this.#state.connect(
      'todos',
      this.commands.clearCompleted$.pipe(
        withLatestFrom(this.#completedTodos$),
        exhaustMap(([, todos]) =>
          forkJoin(todos.map((todo) => this.todoResource.remove(todo)))
        ),
        map((todos) => todos.pop() ?? [])
      )
    );
  }
}
