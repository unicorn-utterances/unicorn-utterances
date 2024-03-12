import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template #helloThereMsg>
      Hello There!
      <ng-template #testingMessage><p>Testing 123</p></ng-template>
      <ng-template [ngTemplateOutlet]="testingMessage"></ng-template>
    </ng-template>
    <ng-template [ngTemplateOutlet]="helloThereMsg"></ng-template>
  `
})
export class AppComponent {}
