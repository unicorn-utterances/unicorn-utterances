import { Component, ViewChild, AfterViewInit, DoCheck, TemplateRef, OnInit } from "@angular/core";

@Component({
  selector: "my-app",
  template: `
    <ng-template #helloThereMsg>
      Hello There!
      <ng-template #testingMessage>Testing 123</ng-template>
    </ng-template>
    <ng-template [ngTemplateOutlet]="helloThereMsg"></ng-template>
    <ng-template [ngTemplateOutlet]="realMsgVar"></ng-template>
  `
})
export class AppComponent implements OnInit, DoCheck, AfterViewInit {
  realMsgVar: TemplateRef<any>;
  @ViewChild("testingMessage", { static: false }) testingMessageCompVar;

  ngOnInit() {
    console.log("ngOnInit: The template is present?", !!this.testingMessageCompVar)
  }
  
  ngDoCheck() {
    console.log("ngDoCheck: The template is present?", !!this.testingMessageCompVar);
    this.realMsgVar = this.testingMessageCompVar;
  }
  
  ngAfterViewInit() {
    console.log('ngAfterViewInit: The template is present?', !!this.testingMessageCompVar);
  }
}
