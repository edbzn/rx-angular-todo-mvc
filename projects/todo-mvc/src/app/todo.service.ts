import { inject, Injectable } from '@angular/core';
import { forkJoin, merge, Observable } from 'rxjs';
import { exhaustMap, map, withLatestFrom } from 'rxjs/operators';
import { rxState } from '@rx-angular/state';
import { rxActions } from '@rx-angular/state/actions';
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

export interface Actions {
  create: Pick<Todo, 'text'>;
  remove: Pick<Todo, 'id'>;
  update: Pick<Todo, 'id' | 'text' | 'done'>;
  toggleAll: void;
  clearCompleted: void;
  setFilter: TodoFilter;
}

const completedTodos = (source: Observable<Todo[]>): Observable<Todo[]> =>
  source.pipe(map((todos) => todos.filter((todo) => todo.done)));

const activeTodos = (source: Observable<Todo[]>): Observable<Todo[]> =>
  source.pipe(map((todos) => todos.filter((todo) => !todo.done)));

@Injectable()
export class TodoService {
  readonly #todoResource = inject(TodoResource);

  readonly actions = rxActions<Actions>();

  readonly #state = rxState<TodoState>(({ set, connect, select }) => {
    set({ filter: 'all' });

    const getAll$ = this.#todoResource
      .getAll()
      .pipe(map((todos) => ({ todos })));
    const setFilter$ = this.actions.setFilter$.pipe(
      map((filter) => ({ filter }))
    );
    const create$ = this.actions.create$.pipe(
      exhaustMap((todo) => this.#todoResource.create(todo)),
      map((todos) => ({ todos }))
    );
    const remove$ = this.actions.remove$.pipe(
      exhaustMap((todo) => this.#todoResource.remove(todo)),
      map((todos) => ({ todos }))
    );
    const update$ = this.actions.update$.pipe(
      exhaustMap((todo) => this.#todoResource.update(todo)),
      map((todos) => ({ todos }))
    );
    const toggleAll$ = this.actions.toggleAll$.pipe(
      withLatestFrom(select('todos')),
      exhaustMap(([, todos]) =>
        forkJoin(
          todos.map((todo) =>
            this.#todoResource.update({
              ...todo,
              done: todos.every(({ done }) => !done),
            })
          )
        )
      ),
      map((updates) => ({ todos: updates.at(-1) }))
    );
    const clearCompleted$ = this.actions.clearCompleted$.pipe(
      withLatestFrom(select('todos').pipe(completedTodos)),
      exhaustMap(([, todos]) =>
        forkJoin(todos.map((todo) => this.#todoResource.remove(todo)))
      ),
      map((updates) => ({ todos: updates.at(-1) }))
    );

    connect(
      merge(
        getAll$,
        setFilter$,
        create$,
        remove$,
        update$,
        toggleAll$,
        clearCompleted$
      )
    );
  });

  readonly filter$ = this.#state.select('filter');
  readonly allTodos$ = this.#state.select('todos');
  readonly completedTodos$ = this.allTodos$.pipe(completedTodos);
  readonly activeTodos$ = this.allTodos$.pipe(activeTodos);
  readonly filteredTodos$ = this.#state.select(
    ['filter', 'todos'],
    ({ todos, filter }) =>
      todos.filter(({ done }) => {
        if (filter === 'active') return !done;
        if (filter === 'completed') return done;
        return true;
      })
  );
}
