import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const config: ApplicationConfig = {
  providers: [provideServerRendering(), provideHttpClient(), provideRouter(routes)],
};
