import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive} from '@angular/core';

@Directive({
  selector: '[renderTheTemplate]'
})
export class RenderTheTemplateDirective implements OnInit {
  constructor (private parentViewRef: ViewContainerRef) {
  }

  @Input() renderTheTemplate: TemplateRef<any>;
  @Input() renderTheTemplateContext: Object;

  ngOnInit(): void {
    this.parentViewRef.createEmbeddedView(this.renderTheTemplate,  this.renderTheTemplateContext);
  }
}

@Component({
  selector: 'my-app',
  template: `
    <ng-template [renderTheTemplate]="template1"
                 [renderTheTemplateContext]="{$implicit: 'Whoa 🤯'}"></ng-template>
    <ng-template #template1 let-message>
        <p>Testing from <code>template1</code>: <b>{{message}}</b></p>
    </ng-template>
  `
})
export class AppComponent {}