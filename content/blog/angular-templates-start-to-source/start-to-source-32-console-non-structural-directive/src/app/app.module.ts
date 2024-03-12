import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent, ConsoleThingDirective } from './app.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, ConsoleThingDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
