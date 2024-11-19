import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoListComponent } from './todo-list.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TodoListComponent, FooterComponent],
  template: `
    <app-todo-list />
    <app-footer />
  `,
})
export class AppComponent {}
