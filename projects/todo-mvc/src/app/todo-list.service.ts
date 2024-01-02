import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { inject, Injectable } from '@angular/core';
import { rxState } from '@rx-angular/state';
import { eventValue, rxActions } from '@rx-angular/state/actions';
import { merge, MonoTypeOperatorFunction } from 'rxjs';
import { exhaustMap, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { Todo, TodoFilter } from './todo.model';
import { TodoResource } from './todo.resource';

interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

interface Actions {
  create: Pick<Todo, 'text'> & { callback: () => void };
  remove: Pick<Todo, 'id'>;
  update: Todo;
  toggleAll: void;
  clearCompleted: void;
  setFilter: TodoFilter;
  drop: CdkDragDrop<Todo[]>;
}

interface Transforms {
  create: (args: {
    text: Event | string;
    callback: () => void;
  }) => Pick<Todo, 'text'> & { callback: () => void };
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

  readonly actions = rxActions<Actions, Transforms>(({ transforms }) => {
    transforms({
      create: (args) => ({ ...args, text: eventValue(args.text) }),
    });
  });

  readonly #state = rxState<TodoState>(({ set, connect, select }) => {
    set({ filter: 'all' });

    connect('todos', this.#todoResource.allTodos.data);

    const setFilter$ = this.actions.setFilter$.pipe(
      map((filter) => ({ filter }))
    );
    const create$ = this.actions.create$.pipe(
      filter(({ text }) => text.trim().length > 0),
      tap(({ callback }) => callback()),
      exhaustMap((todo) => this.#todoResource.addOne.mutateAsync(todo)),
      map((todos) => ({ todos }))
    );
    const remove$ = this.actions.remove$.pipe(
      exhaustMap((todo) => this.#todoResource.removeOne.mutateAsync(todo)),
      map((todos) => ({ todos }))
    );
    const update$ = this.actions.update$.pipe(
      exhaustMap((todo) => this.#todoResource.updateOne.mutateAsync(todo)),
      map((todos) => ({ todos }))
    );
    const toggleAll$ = this.actions.toggleAll$.pipe(
      withLatestFrom(select('todos')),
      exhaustMap(([, todos]) =>
        this.#todoResource.updateMany.mutateAsync(
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
      exhaustMap(([, todos]) =>
        this.#todoResource.updateMany.mutateAsync(todos)
      ),
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
      exhaustMap((todos) => this.#todoResource.updateMany.mutateAsync(todos)),
      map((todos) => ({ todos }))
    );

    connect(
      merge(
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
