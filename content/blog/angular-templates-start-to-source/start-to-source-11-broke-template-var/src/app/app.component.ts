import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <ng-template #helloThereMsg>
      <p>Hello There!</p>
      <ng-template #testingMessage>
        <p>Testing 123</p>
      </ng-template>
    </ng-template>
    <div>
      <ng-template [ngTemplateOutlet]="helloThereMsg"></ng-template>
    </div>
    <ng-template [ngTemplateOutlet]="testingMessage"></ng-template>
  `
})
export class AppComponent {}
