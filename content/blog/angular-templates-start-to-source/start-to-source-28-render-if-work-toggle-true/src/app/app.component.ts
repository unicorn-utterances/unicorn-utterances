import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive} from '@angular/core';

@Directive({
  selector: '[renderThisIf]'
})
export class RenderThisIfDirective {
  constructor (private templ: TemplateRef<any>,
               private parentViewRef: ViewContainerRef) {
  }

  private _val: TemplateRef<any>;

  @Input() set renderThisIf(val: TemplateRef<any>) {
    this._val = val;
    this.update();
  }

  update(): void {
    if (this._val) {
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