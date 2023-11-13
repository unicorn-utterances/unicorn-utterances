import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent, RenderTheTemplateDirective } from './app.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, RenderTheTemplateDirective ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
