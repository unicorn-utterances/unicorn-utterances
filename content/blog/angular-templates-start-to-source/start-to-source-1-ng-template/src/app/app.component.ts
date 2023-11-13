import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template #falseTemp>
      <p>False</p>
    </ng-template>
    <p *ngIf="bool; else falseTemp">True</p>
  `
})
export class AppComponent {
  bool = false;
}
