
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

export const INITIAL_STATE: TodoState = {
  filter: 'all',
  todos: [{ id: 0, text: 'Hello world.', done: false }],
};
