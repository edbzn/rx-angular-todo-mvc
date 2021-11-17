import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PushModule } from '@rx-angular/template/push';
import { LetModule } from '@rx-angular/template/let';

import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list.component';
import { TodoComponent } from './todo.component';

@NgModule({
  declarations: [AppComponent, TodoListComponent, TodoComponent],
  imports: [BrowserModule, PushModule, LetModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
