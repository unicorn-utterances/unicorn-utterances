import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CardsList } from "./card-list.component";
import { ActionCard } from './action-card.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, CardsList, ActionCard],
  bootstrap: [AppComponent]
})
export class AppModule { }
