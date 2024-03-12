import { Component, Input } from "@angular/core";

@Component({
  selector: "my-custom-component",
  template: `
    <p>My value is {{ numberProp }}</p>
  `
})
export class MyComponentComponent {
  @Input() inputHere;

  numberProp = Math.floor(Math.random() * 20);
}
