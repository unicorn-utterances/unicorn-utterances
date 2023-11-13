import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent, MakePigLatinDirective } from './app.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, MakePigLatinDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
