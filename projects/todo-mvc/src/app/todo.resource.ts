import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Todo } from "./todo.service";

const endpoint = new URL('http://localhost:3000/todo');

@Injectable({ providedIn: 'root' })
export class TodoResource {
  readonly #http = inject(HttpClient);

  getAll() {
    return this.#http.get<Todo[]>(endpoint.toString());
  }

  create(todo: Pick<Todo, 'text'>) {
    return this.#http.post<Todo[]>(endpoint.toString(), todo);
  }

  remove(todo: Pick<Todo, 'id'>) {
    return this.#http.delete<Todo[]>(`${endpoint.toString()}/${todo.id}`);
  }

  update(todo: Pick<Todo, 'id' | 'text' | 'done'>) {
    return this.#http.put<Todo[]>(`${endpoint.toString()}/${todo.id}`, todo);
  }
}
