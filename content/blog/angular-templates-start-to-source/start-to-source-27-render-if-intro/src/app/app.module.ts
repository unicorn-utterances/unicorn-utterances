import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent, RenderThisIfDirective } from './app.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, RenderThisIfDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
