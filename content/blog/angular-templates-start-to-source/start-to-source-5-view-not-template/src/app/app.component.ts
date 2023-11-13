import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { MyComponentComponent } from "./my-custom-component.component";

@Component({
  selector: "my-app",
  template: `
    <my-custom-component
      #myComponent
      [inputHere]="50"
      data-unrelatedAttr="Hi there!"
    ></my-custom-component>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChild("myComponent", { static: false })
  myComponent: MyComponentComponent;

  ngAfterViewInit() {
    console.log(this.myComponent.inputHere); // This will print `50`
  }
}
