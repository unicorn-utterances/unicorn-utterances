import { Component, ViewChild } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
 		<div>
			<p>Hello?</p>
	    <ng-template #helloThereMsg>
    	  Hello There!
  	  </ng-template>
		</div>
    <ng-template [ngTemplateOutlet]="realMsgVar"></ng-template>
  `
})
export class AppComponent {
  @ViewChild("helloThereMsg", { static: true }) realMsgVar;
}
