import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive} from '@angular/core';

@Directive({
  selector: '[renderThisIf]'
})
export class RenderThisIfDirective implements OnInit {
  constructor (private templ: TemplateRef<any>,
               private parentViewRef: ViewContainerRef) {
  }

  @Input() renderThisIf: any;
  
  ngOnInit(): void {
    if (this.renderThisIf) {
      this.parentViewRef.createEmbeddedView(this.templ);
    }
  }
}

@Component({
  selector: 'my-app',
  template: `
    <label for="boolToggle">Toggle me!</label>
    <input id="boolToggle" type="checkbox" [(ngModel)]="bool"/>
    <div *renderThisIf="bool">
      <p>Test</p>
    </div>
  `
})
export class AppComponent {
  bool = false;
}