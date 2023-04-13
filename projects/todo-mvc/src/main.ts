import { HttpClientModule } from '@angular/common/http';
import {
  NgZone,
  enableProdMode,
  importProvidersFrom,
  ɵNoopNgZone,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: NgZone, useClass: ɵNoopNgZone },
    importProvidersFrom(HttpClientModule),
  ],
}).catch((err) => console.error(err));
