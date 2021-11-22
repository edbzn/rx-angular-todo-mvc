import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  take,
  tap,
} from 'rxjs';

import { Filter, INITIAL_STATE, Todo } from './todo-state';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly _filter$ = new BehaviorSubject<Filter>('all');
  private readonly _todos$ = new BehaviorSubject<Todo[]>(INITIAL_STATE);

  readonly filter$ = this._filter$.asObservable();
  readonly allTodos$ = this._todos$.asObservable();
  readonly filteredTodos$ = combineLatest([this._todos$, this._filter$]).pipe(
    map(([todos, filter]) =>
      todos.filter((_todo) => this._filterTodo(filter, _todo))
    )
  );
  readonly active$ = this._todos$
    .asObservable()
    .pipe(map((todos) => todos.filter((_todo) => !_todo.done)));
  readonly completed$ = this._todos$
    .asObservable()
    .pipe(map((todos) => todos.filter((_todo) => _todo.done)));

  setFilter(filter: Filter) {
    this._filter$.next(filter);
  }

  createTodo(text: string) {
    return this._todos$.asObservable().pipe(
      take(1),
      map((todos) => [
        ...todos,
        {
          id: Math.round(Math.random() * 100000),
          text,
          done: false,
        },
      ]),
      tap((todos) => this._todos$.next(todos))
    );
  }

  updateTodo(todo: Todo) {
    return this._todos$.asObservable().pipe(
      take(1),
      map((todos) =>
        todos.map((_todo) =>
          _todo.id === todo.id
            ? {
                ..._todo,
                text: todo.text,
                done: todo.done,
              }
            : _todo
        )
      ),
      tap((todos) => this._todos$.next(todos))
    );
  }

  deleteTodo(id: number) {
    return this._todos$.asObservable().pipe(
      take(1),
      map((todos) => todos.filter((_todo) => (_todo.id !== id ? true : false))),
      tap((todos) => this._todos$.next(todos))
    );
  }

  toggleAll(done: boolean) {
    return this._todos$.asObservable().pipe(
      take(1),
      map((todos) =>
        todos.map((_todo) => ({
          ..._todo,
          done,
        }))
      ),
      tap((todos) => this._todos$.next(todos))
    );
  }

  clearCompleted() {
    return this._todos$.asObservable().pipe(
      take(1),
      map((todos) => todos.filter((_todo) => (_todo.done ? false : true))),
      tap((todos) => this._todos$.next(todos))
    );
  }

  private _filterTodo(filter: Filter, todo: Todo) {
    switch (filter) {
      case 'active':
        return !todo.done;
      case 'completed':
        return todo.done;
      default:
        return true;
    }
  }
}
