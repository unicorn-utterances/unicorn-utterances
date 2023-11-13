import { Component, Input } from "@angular/core";

@Component({
  selector: "my-custom-component",
  template: `
    <p>I am a my-custom-component!</p>
  `
})
export class MyComponentComponent {
  @Input() inputHere;
}
