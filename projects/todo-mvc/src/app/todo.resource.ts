import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { UseQuery } from "@ngneat/query";
import { Todo } from "./todo.service";

const endpoint = new URL('http://localhost:3000/todo');

@Injectable({ providedIn: 'root' })
export class TodoResource {
  readonly #http = inject(HttpClient);
  readonly #useQuery = inject(UseQuery);

  getAll() {
    return this.#useQuery(['todos'], () => this.#http.get<Todo[]>(endpoint.toString()));
  }
}
