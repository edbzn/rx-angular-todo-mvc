import { Ufo, UserFlowContext } from '@push-based/user-flow';
import * as fixtures from '../fixtures/todo-list.fixtures';
import { CwvInterface } from '../types/cwv.interface';

export class TodoListUfo extends Ufo implements CwvInterface {
  async createNewTodo(idx: number, value: string) {
    await this.page.type(fixtures.newTodoSelector, value);
    await this.page.keyboard.press('Enter');
    await this.page.waitForSelector(fixtures.todoSelector(idx));
  }

  async awaitLCPContent() {
    await this.page.waitForSelector(fixtures.newTodoSelector);
  }

  async awaitAllContent() {
    await Promise.all([
      this.page.waitForSelector(fixtures.todoSelector(0)),
      this.page.waitForSelector(fixtures.todoSelector(1)),
    ])
  }

  constructor(ctx: UserFlowContext) {
    super(ctx);
  }
}
