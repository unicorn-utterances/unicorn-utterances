import { Component, ViewChild, OnInit, ViewContainerRef, EmbeddedViewRef, TemplateRef } from "@angular/core";

@Component({
  selector: 'my-app',
  template: `
    <ng-template #templ>
      <ul>
        <li>List Item 1</li>
        <li>List Item 2</li>
      </ul>
    </ng-template>
    <div #viewContainerRef class="testing">
    </div>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('viewContainerRef', { read: ViewContainerRef, static: true }) viewContainerRef;
  @ViewChild('templ', { read: TemplateRef, static: true }) templ;

  ngOnInit() {
    const embeddRef: EmbeddedViewRef<any> = this.viewContainerRef.createEmbeddedView(this.templ);
    const embeddIndex = this.viewContainerRef.indexOf(embeddRef);
    console.log(embeddIndex);

    for (let i = 0; i < this.viewContainerRef.length; i++) {
      // This will complain about "Object too large to inspect."
      // Just open your browser's developer tools to see the object consoled
      console.log(this.viewContainerRef.get(i));
    }
  }
}