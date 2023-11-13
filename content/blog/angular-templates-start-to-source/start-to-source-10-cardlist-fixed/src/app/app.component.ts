import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <cards-list>
      <!-- Cards list has default styling with grey background -->
      <action-card></action-card>
      <!-- Action card has default styling with grey background -->
      <action-card></action-card>
      <!-- It's also widely used across the app, so that can't change -->
    </cards-list>
  `
})
export class AppComponent { }
