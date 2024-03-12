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
    <p>The console should output the combination of all values below</p>
    <input type="checkbox" [(ngModel)]="bool" />
    <div *ngIf="bool">
      <my-custom-component></my-custom-component>
    </div>
    <my-custom-component></my-custom-component>
  `
})
export class AppComponent implements AfterViewInit {
  @ViewChildren(MyComponentComponent) myComponents: QueryList<
    MyComponentComponent
  >;

  bool = false;

  ngAfterViewInit() {
    this.myComponents.changes.subscribe(compsQueryList => {
      const componentsNum = compsQueryList.reduce((prev, comp) => {
        return prev + comp.numberProp;
      }, 0);
      console.log(componentsNum); // This would output the combined number from all of the component's `numberProp` field. This would run any time Angular saw a difference in the values
    });
  }
}
