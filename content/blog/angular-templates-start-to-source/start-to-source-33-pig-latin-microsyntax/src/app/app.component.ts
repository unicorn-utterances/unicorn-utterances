import { Component, ViewContainerRef, OnInit, Input, TemplateRef, Directive } from '@angular/core';

import {translatePigLatin} from './translate-to-pig-latin'


@Directive({
  selector: '[makePiglatin]'
})
export class MakePigLatinDirective implements OnInit {
  constructor(private templ: TemplateRef<any>,
    private parentViewRef: ViewContainerRef) { }

  @Input() makePiglatin: string;
  @Input() makePiglatinCasing: 'UPPER' | 'lower';

  ngOnInit() {
    let pigLatinVal = translatePigLatin(this.makePiglatin)
    if (this.makePiglatinCasing === 'UPPER') {
      pigLatinVal = pigLatinVal.toUpperCase();
    } else if (this.makePiglatinCasing === 'lower') {
      pigLatinVal = pigLatinVal.toLowerCase();
    }
    this.parentViewRef.createEmbeddedView(this.templ, {
      $implicit: pigLatinVal,
      original: this.makePiglatin
    });
  }
}

@Component({
  selector: 'my-app',
  template: `
    <p *makePiglatin="'This is a string'; casing: 'UPPER'; let msg; let ogMsg = original">
      The message "{{msg}}" is "{{ogMsg}}" in 🐷 Latin
    </p>
  `
})
export class AppComponent { }