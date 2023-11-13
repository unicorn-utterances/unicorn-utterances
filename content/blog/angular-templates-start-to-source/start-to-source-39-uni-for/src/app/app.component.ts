import { Component, ViewContainerRef, AfterViewInit, Input, TemplateRef, Directive } from '@angular/core';

import {of} from 'rxjs';

@Directive({ selector: '[uniFor]' })
export class UniForOf<T> implements AfterViewInit {
  @Input() uniForOf: Array<T>;

  constructor(
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<any>
  ) {}

  ngAfterViewInit() {
    this.uniForOf.forEach((ofItem, i) => {
      this.viewContainer.createEmbeddedView(this.template, {
        isFirst: i === 0,
        $implicit: ofItem,
        uniForOf: this.uniForOf
      })
    })
  }
}

@Component({
  selector: 'my-app',
  template: `
	<p *uniFor="let num of numbers | async as allNumbers; let firstItem = isFirst">
		Number in a list of {{allNumbers.length}} numbers: {{num}}
		<ng-container *ngIf="firstItem"> it's the first number!</ng-container>
	</p>
	`
})
export class AppComponent {
  // `import {of} from 'rxjs';`
  numbers = of([1,2,3,4,5])
}