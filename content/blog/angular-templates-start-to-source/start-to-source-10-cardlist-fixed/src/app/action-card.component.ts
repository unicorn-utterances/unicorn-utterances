import { Component } from "@angular/core";

@Component({
  selector: "action-card",
  template: `
    <div>This is a card</div>
  `,
  styles: [
    `
      :host {
        border: 1px solid black;
        display: inline-block;
        height: 300px;
        width: 100px;
        background: grey;
        margin: 10px;
      }
    `
  ]
})
export class ActionCard {}
