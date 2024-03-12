import { Component, ViewChild, TemplateRef } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <div>
      <ng-template #helloMsg>Hello</ng-template>
    </div>
    <ng-template [ngTemplateOutlet]="helloMessageTemplate"></ng-template>
  `
})
export class AppComponent {
  @ViewChild("helloMsg", { static: false }) helloMessageTemplate: TemplateRef<any>;
}
