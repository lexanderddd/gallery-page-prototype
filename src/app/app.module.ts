import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import {provideAnimations} from "@angular/platform-browser/animations";
import {Menu} from "./components/menu/menu";

@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        Menu
    ],
  providers: [
    provideAnimations(),
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
