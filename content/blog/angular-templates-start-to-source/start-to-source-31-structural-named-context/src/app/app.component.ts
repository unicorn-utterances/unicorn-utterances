import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive } from '@angular/core';

import {translatePigLatin} from './translate-to-pig-latin'


@Directive({
  selector: '[makePiglatin]'
})
export class MakePigLatinDirective {
  constructor(private templ: TemplateRef<any>,
    private parentViewRef: ViewContainerRef) {}

  @Input() set makePiglatin(val: string) {
    this.parentViewRef.createEmbeddedView(this.templ, {
      $implicit: translatePigLatin(val),
      original: val
    });
  }
}

@Component({
  selector: 'my-app',
  template: `
    <p *makePiglatin="'This is a string'; let msg; let ogMsg = original">
      The message "{{msg}}" is "{{ogMsg}}" in 🐷 Latin
    </p>
  `
})
export class AppComponent {}