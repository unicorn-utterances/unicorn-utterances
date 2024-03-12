import { Component, ViewContainerRef, OnInit, AfterViewInit, ContentChild, ViewChild, TemplateRef , EmbeddedViewRef} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
   <ng-template #templ let-i>
        <li>List Item {{i}}</li>
        <li>List Item {{i + 1}}</li>
    </ng-template>
    <ul>
      <ng-container #viewContainerRef></ng-container>
    </ul>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('viewContainerRef', {read: ViewContainerRef, static: true}) viewContainerRef;
  @ViewChild('templ', {read: TemplateRef, static: true}) templ;

  ngOnInit() {
    const viewRef1 = this.templ.createEmbeddedView({ $implicit: 1 });
    this.viewContainerRef.insert(viewRef1);
    const viewRef3 = this.templ.createEmbeddedView({ $implicit: 3 });
    this.viewContainerRef.insert(viewRef3);
  }
}