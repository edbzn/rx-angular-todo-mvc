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
  todos: [
    { id: 0, text: 'Call mom', done: false },
    { id: 1, text: 'Pay bills', done: true },
  ],
};
