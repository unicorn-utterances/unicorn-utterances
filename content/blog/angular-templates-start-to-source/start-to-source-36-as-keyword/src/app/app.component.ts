import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <p *ngIf="message | uppercase as uppermessage">{{uppermessage}}</p>
		<!-- Will output "HELLO THERE, WORLD" -->
  `
})
export class AppComponent {
  message = "Hello there, world"
}