import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TemplateModule } from '@rx-angular/template';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list.component';
import { TodoComponent } from './todo.component';


@NgModule({
  declarations: [AppComponent, TodoListComponent, TodoComponent],
  imports: [BrowserModule, TemplateModule, AppRoutingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
