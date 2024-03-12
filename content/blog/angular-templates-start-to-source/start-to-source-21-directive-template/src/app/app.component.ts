import { Component, ViewContainerRef, OnInit, AfterViewInit, ContentChild, ViewChild, TemplateRef , EmbeddedViewRef, Directive} from '@angular/core';

@Directive({
  selector: '[renderTheTemplate]'
})
export class RenderTheTemplateDirective implements OnInit {
  @ContentChild(TemplateRef, {static: true}) templ;
  constructor (private parentViewRef: ViewContainerRef) {
  }

  ngOnInit(): void {
    this.parentViewRef.createEmbeddedView(this.templ);
  }
}

@Component({
  selector: 'my-app',
  template: `
    <div renderTheTemplate>
      <ng-template>
          <p>Hello</p>
      </ng-template>
    </div>
  `
})
export class AppComponent {}