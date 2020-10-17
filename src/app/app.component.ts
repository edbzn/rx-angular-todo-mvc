import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-todo-list></app-todo-list>
    <footer>
      An <strong>Angular zoneless experiment</strong> using
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/state/README.md"
        >
          @rx-angular/state</a>
      </code>
      to manage state and
      <code>
        <a
          href="https://github.com/rx-angular/rx-angular/blob/master/libs/template/README.md"
          >@rx-angular/template</a
        ></code
      >
      to detect changes.
    </footer>
  `,
})
export class AppComponent {}
