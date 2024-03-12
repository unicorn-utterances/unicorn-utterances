import {
  Component,
  ViewChildren,
  QueryList,
  AfterViewInit
} from "@angular/core";
import { MyComponentComponent } from "./my-custom-component.component";

@Component({
  selector: "my-app",
  template: `
    <div>
      <p>Check the console to see that values of the two components</p>
      <my-custom-component [inputHere]="50"></my-custom-component>
      <my-custom-component [inputHere]="80"></my-custom-component>
    </div>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChildren(MyComponentComponent) myComponents: QueryList<
    MyComponentComponent
  >;

  ngAfterViewInit() {
    console.log(this.myComponents.length); // This will output 2
  }
}
