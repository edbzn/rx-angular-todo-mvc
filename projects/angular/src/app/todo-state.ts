export type Filter = 'all' | 'completed' | 'active';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const INITIAL_STATE = [
  { id: 0, text: 'Call mom', done: false },
  { id: 1, text: 'Pay bills', done: true },
];
