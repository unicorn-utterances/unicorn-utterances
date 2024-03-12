import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template #falseTemp>
      <p>False</p>
    </ng-template>
    <ng-template #ifTrueCondTempl>
      <p>True</p>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="bool ? ifTrueCondTempl : falseTemp"
    ></ng-template>
  `
})
export class AppComponent {
  bool = true;
}
