import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { inject, Injectable } from '@angular/core';
import { rxState } from '@rx-angular/state';
import { rxActions } from '@rx-angular/state/actions';
import { merge, MonoTypeOperatorFunction } from 'rxjs';
import { exhaustMap, map, withLatestFrom } from 'rxjs/operators';
import { Todo, TodoFilter } from './todo.model';
import { TodoResource } from './todo.resource';

interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

interface Actions {
  create: Pick<Todo, 'text'>;
  remove: Pick<Todo, 'id'>;
  update: Todo;
  toggleAll: void;
  clearCompleted: void;
  setFilter: TodoFilter;
  drop: CdkDragDrop<Todo>;
}

const completedTodos: MonoTypeOperatorFunction<Todo[]> = (source) => {
  return source.pipe(map((todos) => todos.filter((todo) => todo.done)));
};

const activeTodos: MonoTypeOperatorFunction<Todo[]> = (source) => {
  return source.pipe(map((todos) => todos.filter((todo) => !todo.done)));
};

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
      exhaustMap((todo) => this.#todoResource.removeOne(todo)),
      map((todos) => ({ todos }))
    );
    const update$ = this.actions.update$.pipe(
      exhaustMap((todo) => this.#todoResource.updateOne(todo)),
      map((todos) => ({ todos }))
    );
    const toggleAll$ = this.actions.toggleAll$.pipe(
      withLatestFrom(select('todos')),
      exhaustMap(([, todos]) =>
        this.#todoResource.updateMany(
          todos.map((todo) => ({
            ...todo,
            done: todos.every(({ done }) => !done),
          }))
        )
      ),
      map((todos) => ({ todos }))
    );
    const clearCompleted$ = this.actions.clearCompleted$.pipe(
      withLatestFrom(select('todos').pipe(activeTodos)),
      exhaustMap(([, todos]) => this.#todoResource.updateMany(todos)),
      map((todos) => ({ todos }))
    );
    const drop$ = this.actions.drop$.pipe(
      withLatestFrom(select('todos')),
      map(([{ previousIndex, currentIndex }, todos]) => {
        const todo = todos[previousIndex];
        const updatedTodos = [...todos];
        updatedTodos.splice(previousIndex, 1);
        updatedTodos.splice(currentIndex, 0, todo);
        return updatedTodos;
      }),
      exhaustMap((todos) => this.#todoResource.updateMany(todos)),
      map((todos) => ({ todos }))
    );

    connect(
      merge(
        getAll$,
        setFilter$,
        create$,
        remove$,
        update$,
        toggleAll$,
        clearCompleted$,
        drop$
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
