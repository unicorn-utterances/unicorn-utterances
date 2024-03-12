import {
  Component,
  ContentChildren,
  ElementRef,
  AfterViewInit,
  Renderer2
} from "@angular/core";

import { ActionCard } from "./action-card.component";

@Component({
  selector: "cards-list",
  template: `
    <div><ng-content></ng-content></div>
  `,
  styles: [
    `
      :host {
        background: grey;
        display: block;
      }
    `
  ]
})
export class CardsList implements AfterViewInit {
  constructor(private renderer: Renderer2) {}
  @ContentChildren(ActionCard, { read: ElementRef }) actionCards;

  ngAfterViewInit() {
    // Any production code should absolutely be running `Renderer2` to do this rather than modifying the native element yourself
    this.actionCards.forEach(elRef => {
      console.log("Changing background of a card");
      this.renderer.setStyle(elRef.nativeElement, "background", "white");
    });
  }
}
