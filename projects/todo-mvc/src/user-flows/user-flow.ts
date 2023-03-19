import {
  UserFlowContext,
  UserFlowInteractionsFn,
  UserFlowOptions,
  UserFlowProvider
} from '@push-based/user-flow';
import { readBudgets } from '@push-based/user-flow/src/lib/commands/assert/utils/budgets';
import { TodoListUfo } from './ufo/todo-list.ufo';

const flowOptions: UserFlowOptions = {
  name: 'Basic user flow to ensure MVC functionality',
};

const listBudgets = readBudgets(
  './projects/todo-mvc/src/user-flows/configs/budgets.json'
);

const interactions: UserFlowInteractionsFn = async (
  ctx: UserFlowContext
): Promise<any> => {
  const { flow } = ctx;
  const url = `http://localhost:4200/`;
  const todoList = new TodoListUfo(ctx);

  await flow.navigate(url, {
    stepName: '🧭 Initial navigation',
    config: {
      extends: 'lighthouse:default',
      settings: {
        budgets: listBudgets,
      },
    },
  });
  await todoList.awaitLCPContent();
  await todoList.awaitAllContent();
  await flow.snapshot({
    stepName: '✔ Initial navigation done',
  });
  await flow.startTimespan({
    stepName: '🧭 Add new todo',
  });
  await todoList.createNewTodo(2, 'Do my homework');
  await flow.endTimespan();
  await flow.snapshot({
    stepName: '✔ Add new todo done',
  });

  return Promise.resolve();
};

const userFlowProvider: UserFlowProvider = {
  flowOptions,
  interactions,
};

module.exports = userFlowProvider;
