import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TodoListComponent } from './todo-list.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-todo-list></app-todo-list>
    <footer>
      <strong>Angular Zoneless experiment</strong> using
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

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, TodoListComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
