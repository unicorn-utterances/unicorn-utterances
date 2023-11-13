import { Component, ViewChild, AfterViewInit, ElementRef } from "@angular/core";

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
  @ViewChild("myComponent", { read: ElementRef, static: false })
  myComponent: ElementRef;

  ngAfterViewInit() {
    console.log(
      this.myComponent.nativeElement.getAttribute("data-unrelatedAttr")
    ); // This output `"Hi there!"`  }
  }
}
