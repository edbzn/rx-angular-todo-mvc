import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoListComponent } from './todo-list.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TodoListComponent],
  template: `
    <app-todo-list />
    <footer>
      <strong>Fully zoneless Angular app</strong> using
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/state/README.md"
        >
          &#64;rx-angular/state</a>
      </code>
      to manage state and
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/template/README.md"
          >&#64;rx-angular/template</a
        ></code
      >
      to detect changes.
    </footer>
  `,
})
export class AppComponent {}
