import {
  Component,
  ViewChildren,
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
  styles: [`:host {background: grey; display: block;}`
  ]
})
export class CardsList implements AfterViewInit {
  constructor(private renderer: Renderer2) { }
  @ViewChildren(ActionCard, { read: ElementRef }) actionCards;

  ngAfterViewInit() {
    // Any production code should absolutely be cleaning this up properly, this is just for demonstration purposes
    this.actionCards.forEach(elRef => {
      console.log("Changing background of a card");
      this.renderer.setStyle(elRef.nativeElement, "background", "white");
    });
  }
}
