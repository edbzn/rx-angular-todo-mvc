import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { Todo } from './todo.model';

@Injectable({ providedIn: 'root' })
export class TodoResource {
  readonly #http = inject(HttpClient);

  private static endpoint = new URL('http://localhost:3000/todo').toString();

  allTodos = injectQuery(() => ({
    queryKey: ['todos'],
    initialData: [],
    queryFn: () => lastValueFrom(this.#http.get<Todo[]>(TodoResource.endpoint)),
  }));

  addOne = injectMutation(() => ({
    mutationFn: (todo: Pick<Todo, 'text'>) =>
      lastValueFrom(this.#http.post<Todo[]>(TodoResource.endpoint, todo)),
    retry: 5,
  }));

  removeOne = injectMutation(() => ({
    mutationFn: (todo: Pick<Todo, 'id'>) =>
      lastValueFrom(
        this.#http.delete<Todo[]>(`${TodoResource.endpoint}/${todo.id}`)
      ),
    retry: 5,
  }));

  updateOne = injectMutation(() => ({
    mutationFn: (todo: Todo) =>
      lastValueFrom(
        this.#http.put<Todo[]>(`${TodoResource.endpoint}/${todo.id}`, todo)
      ),
    retry: 5,
  }));

  updateMany = injectMutation(() => ({
    mutationFn: (todos: Todo[]) =>
      lastValueFrom(this.#http.put<Todo[]>(`${TodoResource.endpoint}`, todos)),
    retry: 5,
  }));
}
