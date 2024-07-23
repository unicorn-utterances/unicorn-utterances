---
{
	title: "Angular Dynamic host Property Usage",
	description: "In directives and components alike, it can be a pain to add attributes and bindings to the host element. Instead of using DI to change the host, try this instead.",
	published: '2023-12-28T13:45:00.284Z',
	tags: ['angular', 'webdev', 'javascript'],
	license: 'cc-by-nc-sa-4'
}
---


Angular is a _powerful_ framework. Most folks know of it as the component framework, but it's much more than that.

For example, did you know about Angular directives?

Directives allow you to bind to an element via an attribute and change the behavior of said element.

```typescript
import { Component, Directive } from '@angular/core';

@Directive({
  selector: '[doNothing]',
  standalone: true,
})
class DoNothingDirective {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DoNothingDirective],
  template: `
    <p doNothing>I am currently unchanged.</p>
`,
})
class AppComponent {}
```

<iframe data-frame-title="Do Nothing Directive - StackBlitz" src="pp-code:./do-nothing-directive?template=node&embed=1&file=src%2Fmain.ts"></iframe>

Think of them as components without templates. They can use lifecycle methods:

```typescript
@Directive({
  selector: '[alertOnDestroy]',
  standalone: true,
})
class AlertOnDestroyDirective implements OnDestroy {
  ngOnDestroy() {
    alert('Element was unrendered!');
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AlertOnDestroyDirective, NgIf],
  template: `
    <p *ngIf="render" alertOnDestroy>Unmount me to see an alert!</p>
    <button (click)="render = !render">Toggle</button>
`,
})
class AppComponent {
  render = true;
}
```

<iframe data-frame-title="Alert On Destroy - StackBlitz" src="pp-code:./alert-on-destroy?template=node&embed=1&file=src%2Fmain.ts"></iframe>

Store state:

```typescript
@Directive({
  selector: '[listenForEvents]',
  standalone: true,
})
class ListenForEventDirective implements OnInit {
  count = 0;
  ngOnInit() {
    document.addEventListener('hello', () => {
      alert(`You sent this many events: ${++this.count}`);
    });
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ListenForEventDirective],
  template: `
    <p listenForEvents>This paragraph tag listens for events!</p>
    <button (click)="sendEvent()">Send event</button>
`,
})
class AppComponent {
  sendEvent() {
    const event = new CustomEvent('hello');
    document.dispatchEvent(event);
  }
}
```

<iframe data-frame-title="Listen for Events - StackBlitz" src="pp-code:./listen-for-events?template=node&embed=1&file=src%2Fmain.ts"></iframe>

Use the `inject` function:

```typescript
import { Component, Directive, inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[listenForEvents]',
  standalone: true,
})
class ListenForEventDirective implements OnInit {
  count = 0;

  doc = inject(DOCUMENT);

  ngOnInit() {
    this.doc.addEventListener('hello', () => {
      alert(`You sent this many events: ${++this.count}`);
    });
  }
}
```

<iframe data-frame-title="Listen for Events Inject - StackBlitz" src="pp-code:./listen-for-events-inject?template=node&embed=1&file=src%2Fmain.ts"></iframe>

And do just about anything else a component can do without a template of its own.

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of articles like this." button-text="Visit our Open Collective" button-href="https://opencollective.com/unicorn-utterances" -->

# Accessing a directives' element with `ElementRef`

Because a directive is attached to an element, a typical usage of a directive is to modify the element it's attached to using `ElementRef` and `inject`; like so:

```typescript
const injectAndGetEl = () => {
  const el = inject(ElementRef);
  console.log(el.nativeElement);
  return el;
};

@Directive({
  selector: '[logEl]',
  standalone: true,
})
class LogElDirective {
  _el = injectAndGetEl();
}
```

<iframe data-frame-title="Log Element - StackBlitz" src="pp-code:./log-element?template=node&embed=1&file=src%2Fmain.ts"></iframe>

While this doesn't do anything yet, it logs the element to the `console.log` method. Let's instead change this code to make the attached element have a red background and white text:

```typescript
import { Component, Directive, ElementRef, inject } from '@angular/core';

const injectAndMakeRed = () => {
  const el = inject(ElementRef);
  el.nativeElement.style.backgroundColor = 'red';
  el.nativeElement.style.color = 'white';
};

@Directive({
  selector: '[red]',
  standalone: true,
})
class RedDirective {
  _el = injectAndMakeRed();
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RedDirective],
  template: `
    <p red>This is red</p>
`,
})
class AppComponent {}
```

<iframe data-frame-title="Red Directive - StackBlitz" src="pp-code:./red-directive?template=node&embed=1&file=src%2Fmain.ts"></iframe>

# `host` property binding

While the `inject` method works, there's a better way to bind an element: the `host` property.

```typescript
@Directive({
  selector: '[red]',
  standalone: true,
  host: {
    style: 'background-color: red; color: white;',
  },
})
class RedDirective {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RedDirective],
  template: `
    <p red>This is red</p>
`,
})
class AppComponent {}
```

<iframe data-frame-title="Red Host Directive - StackBlitz" src="pp-code:./red-host-directive?template=node&embed=1&file=src%2Fmain.ts"></iframe>

Here, `host` refers to the element the directive is attached to. We can use it to then attach new attributes to the parent element like we did above.

# Dynamic `host` property binding

`host` isn't just useful for static attribute bindings either, you can use it with attribute binding and event listening using the same `[]` and `()` syntax you're familiar with:

````typescript
@Directive({
  selector: '[red]',
  standalone: true,
  host: {
    '[style]': `selected ? 'background-color: red; color: white;' : ''`,
    '(click)': 'selected = !selected',
  },
})
class RedDirective {
  selected = false;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RedDirective],
  template: `
    <p red>This is red when I am selected</p>
`,
})
class AppComponent {}
````

<iframe data-frame-title="Red Dynamic Host Directive - StackBlitz" src="pp-code:./red-dynamic-host-directive?template=node&embed=1&file=src%2Fmain.ts"></iframe>

# Using `host` property with Components

Because components are [just like directives but with a template, complete with a host element](/posts/angular-templates-dont-work-how-you-think), we can use the same `host` directive on components as well as directives:

```typescript
@Component({
  selector: 'red-div',
  standalone: true,
  host: {
    '[style]': `selected ? 'background-color: red; color: white;' : ''`,
    '(click)': 'selected = !selected',
  },
  template: `
    <span><ng-content/></span>
  `,
})
class RedDirective {
  selected = false;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RedDirective],
  template: `
    <red-div>This is red when I am selected</red-div>
`,
})
class AppComponent {}
```

<iframe data-frame-title="Red Div Component - StackBlitz" src="pp-code:./red-div-component?template=node&embed=1&file=src%2Fmain.ts"></iframe>

This will output to something akin to the following Angular template:

```html
<red-div
	[style]="selected ? 'background-color: red; color: white;' : ''"
  (click)="selected = !selected"
>
  <span>This is red when I am selected</span>
</red-div>
```

