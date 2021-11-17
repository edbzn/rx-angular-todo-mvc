import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LetModule } from '@rx-angular/template/let';

import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list.component';
import { TodoComponent } from './todo.component';

@NgModule({
  declarations: [AppComponent, TodoListComponent, TodoComponent],
  imports: [BrowserModule, LetModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
