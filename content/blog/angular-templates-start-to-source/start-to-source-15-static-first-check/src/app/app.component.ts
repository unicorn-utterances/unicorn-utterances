import { Component, ViewChild } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template #helloThereMsg>
      Hello There!
      <ng-template #testingMessage>Testing 123</ng-template>
    </ng-template>
    <ng-template [ngTemplateOutlet]="helloThereMsg"></ng-template>
    <ng-template [ngTemplateOutlet]="testingMessageCompVar"></ng-template>
  `
})
export class AppComponent {
  @ViewChild("testingMessage", { static: true }) testingMessageCompVar;
}
