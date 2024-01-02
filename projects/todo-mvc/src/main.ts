import { HttpClientModule } from '@angular/common/http';
import { NgZone, importProvidersFrom, ɵNoopNgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  QueryClient,
  provideAngularQuery,
} from '@tanstack/angular-query-experimental';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: NgZone, useClass: ɵNoopNgZone },
    importProvidersFrom(HttpClientModule),
    provideAngularQuery(new QueryClient()),
  ],
}).catch((err) => console.error(err));
