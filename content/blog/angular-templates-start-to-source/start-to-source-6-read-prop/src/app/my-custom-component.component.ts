import { Component, Input } from "@angular/core";

@Component({
  selector: "my-custom-component",
  template: `
    <p>Check the console to see the inputs' values from the parent component</p>
  `
})
export class MyComponentComponent {
  @Input() inputHere;
}
