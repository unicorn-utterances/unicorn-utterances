import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template
      [ngTemplateOutlet]="showMsgToPerson"
      [ngTemplateOutletContext]="{
        $implicit: 'Hello World',
        personName: 'Corbin'
      }"
    >
    </ng-template>
    <ng-template #showMsgToPerson let-message let-thisPersonsName="personName">
      <p>{{ message }} {{ thisPersonsName }}</p>
    </ng-template>
  `
})
export class AppComponent { }
