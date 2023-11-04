import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Todo } from "./todo.model";

@Injectable({ providedIn: 'root' })
export class TodoResource {
  readonly #http = inject(HttpClient);

  private static endpoint = new URL('http://localhost:3000/todo').toString();

  getAll() {
    return this.#http.get<Todo[]>(TodoResource.endpoint);
  }

  create(todo: Pick<Todo, 'text'>) {
    return this.#http.post<Todo[]>(TodoResource.endpoint, todo);
  }

  removeOne(todo: Pick<Todo, 'id'>) {
    return this.#http.delete<Todo[]>(`${TodoResource.endpoint}/${todo.id}`);
  }

  updateOne(todo: Todo) {
    return this.#http.put<Todo[]>(`${TodoResource.endpoint}/${todo.id}`, todo);
  }

  updateMany(todos: Todo[]) {
    return this.#http.put<Todo[]>(TodoResource.endpoint, todos);
  }
}
