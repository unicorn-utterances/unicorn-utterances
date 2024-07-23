---
{
	title: "Better Angular Form Components with ngModel and formControl Implementation",
	description: "Some components make controlling their state easier with 'formControl' and 'ngModel'. Let's see how we can build our own!",
	published: '2020-06-09T13:45:00.284Z',
	tags: ['angular', 'javascript'],
	license: 'cc-by-nc-sa-4'
}
---

One of Angular's greatest strengths over its contemporaries like React or Vue is that it's a framework. What does this mean in the practical sense? Well, because you're providing the defaults for everything right out-of-the-box, you have a set of guard rails to follow when architecting new things. A set of baseline rules for things to follow, so to speak.

One such guard rail comes in the form of the `@angular/forms` package. If you've used Angular for long, you're doubtlessly familiar with [the `[(ngModel)]` method of two-way data binding in the UI](https://angular.io/guide/forms#two-way-data-binding-with-ngmodel). Seemingly all native elements have support for this feature (so long as you have `FormsModule` imported in your module).

More than that, if you want more powerful functionality, such as disabling an entire form of fields, tracking a collection of fields in a form, and doing basic data validation, [you can utilize Angular Reactive Forms' `[formControl]`](https://angular.io/guide/reactive-forms#adding-a-basic-form-control) and do all of that and more.

These features are hugely helpful when dealing with complex form logic throughout your application. Luckily for us, they're not just exclusive to native elements - we can implement this functionality into our own form!

# Example {#code-demo}

It's hard for us to talk about the potential advantages to a component without taking a look at it. Let's start with this component, just for fun.

It'll allow you to type in data, have a header label (as opposed to a floating label, [which is notoriously bad for A11Y](https://www.matsuko.ca/blog/stop-using-material-design-text-fields/)), and even present a fun message when "Unicorns" is typed in.

Here's the code:

```typescript
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-example-input",
  template: `
    <label class="inputContainer">
      <span class="inputLabel">{{ placeholder }}</span>
      <input
        placeholder=""
        class="inputInput"
        [(ngModel)]="value"
      />
    </label>
    <p
      class="hiddenMessage"
      [class.hideTheMessage]="!isSecretValue"
      aria-hidden="true"
    >
      You unlocked the secret unicorn rave!<span>🦄🦄🦄</span>
    </p>
    <!-- This is for screen-readers, since the animation doesn't work with the 'aria-live' toggle -->
    <p aria-live="assertive" class="visually-hidden">
      {{
        isSecretValue
          ? "You discovered the secret unicorn rave! They're all having a party now that you summoned them by typing their name"
          : ""
      }}
    </p>
  `,
  styleUrls: ["./example-input.component.css"]
})
export class ExampleInputComponent {
  @Input() placeholder: string;
  value: any = "";

  get isSecretValue() {
    return /unicorns/.exec(this.value.toLowerCase());
  }
}
```

With only a bit of CSS, we have a visually appealing, A11Y friendly, and quirky input component. Look, it even wiggles the unicorns!

<iframe data-frame-title="Angular Unicorns Text Input - StackBlitz" src="pp-code:./angular-unicorns-text-input?embed=1&file=src/app/app.component.ts" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Now, this component is far from feature complete. There's no way to `disable` the input, there's no way to extract data out from the typed input, there's not a lot of functionality you'd typically expect to see from an input component. Let's change that.

# ControlValueAccessor {#intro-concept}

Most of the expected form functionality will come as a complement of [the `ControlValueAccessor` interface](https://angular.io/api/forms/ControlValueAccessor). Much like you implement `ngOnInit` by implementing class methods, you do the same with ControlValueAccessor to gain functionality for form components.

The methods you need to implement are the following:

- `writeValue`
- `registerOnChange`
- `registerOnTouched`
- `setDisabledState`

Let's go through these one-by-one and see how we can introduce change to our component to support each one.

## Setup {#forwardRef}

To use these four methods, you'll first need to `provide` them somehow. To do this, we use a combination of the component's `providers` array, `NG_VALUE_ACCESSOR`, and `forwardRef`.

```typescript
import { forwardRef } from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

/**
 * Provider Expression that allows your component to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 */
export const EXAMPLE_CONTROL_VALUE_ACCESSOR: any = {  
  /**
   * Used to provide a `ControlValueAccessor` for form controls.
   */
  provide: NG_VALUE_ACCESSOR,
  /**
   * Allows to refer to references which are not yet defined.
   * This is because it's needed to `providers` in the component but references
   * the component itself. Handles circular dependency issues
   */
  useExisting: forwardRef(() => ExampleInputComponent),
  multi: true
};
```

Once we have this example provide setup, we can now pass it to a component's `providers` array:

```typescript
@Component({
  selector: 'app-example-input',
  templateUrl: './example-input.component.html',
  styleUrls: ['./example-input.component.css'],
  providers: [EXAMPLE_CONTROL_VALUE_ACCESSOR]
})
export class ExampleInputComponent implements ControlValueAccessor {
```

With this, we'll finally be able to use these methods to control our component.

> If you're wondering why you don't need to do something like this with `ngOnInit`, it's because that functionality is baked right into Angular. Angular _always_ looks for an `onInit` function and tries to call it when the respective lifecycle method is run. `implements` is just a type-safe way to ensure that you're explicitly wanting to call that method.


## `writeValue` {#write-value}

`writeValue` is a method that acts exactly as you'd expect it to: It simply writes a value to your component's value. As your value has more than a single write method (from your component and from the parent), it's suggested to have a setter, getter, and private internal value for your property.

```typescript
 private _value: any = null;

  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    if (this._value !== newValue) {
      // Set this before proceeding to ensure no circular loop occurs with selection.
      this._value = newValue;
    }
  }
```

Once this is done, the method is trivial to implement:

```typescript
 writeValue(value: any) {
    this.value = value;
  }
```

However, you may notice that your component doesn't properly re-render when you update your value from the parent component. Because you're updating your value outside of the typical pattern, change detection may have a difficult time running when you'd want it to. To solve for this, provide a `ChangeDetectorRef` in your constructor and manually check for updates in the `writeValue` method:

```typescript
export class ExampleInputComponent implements ControlValueAccessor {
  // ...
  constructor(private _changeDetector: ChangeDetectorRef) { }
   // ...
 writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }
```

Now, when we use a value like `new FormValue('test')` and pass it as `[formControl]` to our component, it will render the correct default value

## `setDisabledState` {#disabled-state}

Implementing the disabled state check is extremely similar to [implementing value writing](#write-value). Simply add a setter, getter, and `setDisabledState` to your component, and you should be good-to-go:

```typescript
 private _disabled: boolean = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._changeDetector.markForCheck();
  }
```

Just as we did with value writing, we want to run a `markForCheck` to allow change detection to work as expected when the value is changed from a parent

> It's worth mentioning that unlike the other three methods, this one is entirely optional for implementing a `ControlValueAccessor`. This allows us to disable the component or keep it enabled but is not required for usage with the other methods. `ngModel` and `formControl` will work without this method implemented.

## `registerOnChange` {#register-on-change}

While the previous methods have been implemented in a way that required usage of `markForCheck`, these last two methods are implemented in a bit of a different way. You only need look at the type of the methods on the interface to see as much:

```typescript
registerOnChange(fn: (value: any) => void);
```

As you might be able to deduce from the method type, when `registerOnChange` is called, it passes you a function. You'll then want to store this function in your class instance and call it whenever the user changes data.

```typescript
/** The method to be called to update ngModel */
_controlValueAccessorChangeFn: (value: any) => void = () => {};

registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
}
```

While this code sample shows you how to store the function, it doesn't outline how to call it once stored. You'll want to make sure to call it with the updated value on every update. For example, if you are expecting an `input` to change, you'd want to add it to `(change)` output of the `input`:

```html
<input
       placeholder=""
       [disabled]="disabled"
       [(ngModel)]="value"
       (change)="_controlValueAccessorChangeFn($event.target.value)"
/>
```

## `registerOnTouched` {#register-on-touched}

Like how you [store a function and call it to register changes](#register-on-change), you do much of the same to register when a component has been "touched" or not. This tells your consumer when a component has had interaction or not.

```typescript
onTouched: () => any = () => {};

registerOnTouched(fn: any) {
	this.onTouched = fn;
}
```

You'll want to call this `onTouched` method any time that your user "touches" (or, interacts) with your component. In the case of an `input`, you'll likely want to place it on the `(blur)` output:

```html
<input
    placeholder=""
    [disabled]="disabled"
    [(ngModel)]="value"
    (change)="onChange($event)"
    (blur)="onTouched()"
/>
```

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of articles like this." button-text="Visit our Open Collective" button-href="https://opencollective.com/unicorn-utterances" -->

# Consumption {#consume-demo}

Now that we've done that work let's put it all together, apply [the styling from before](#code-demo), and consume the component we've built!

We'll need to start by importing `FormModule` and `ReactiveFormModule` into your `AppModule` for `ngModel` and `formControl` support respectively.

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ExampleInputComponent } from './example-input/example-input.component';

@NgModule({
  imports:      [ ReactiveFormsModule, FormsModule, BrowserModule ],
  declarations: [ AppComponent, ExampleInputComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
```

Once you have support for them both, you can move onto adding a `formControl` item to your parent component:

```typescript
import { Component } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  control = new FormControl('');
  modelValue = "";
}
```

Finally, you can pass these options to `ngModel` and `formControl` (or even `formControlName`) and inspect the value directly from the parent itself:

```html
<h1>Form Control</h1>
<app-example-input placeholder="What's your favorite animal?" [formControl]="control"></app-example-input>
<p>The value of the input is: {{control.value}}</p>
<h1>ngModel</h1>
<app-example-input placeholder="What's your favorite animal?" [(ngModel)]="modelValue"></app-example-input>
<p>The value of the input is: {{modelValue}}</p>
```

If done properly, you should see something like this:


<iframe data-frame-title="Angular Value Accessor Example - StackBlitz" src="pp-code:./angular-value-accessor-example?embed=1&file=src/app/app.component.ts" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

# Form Control Classes

Angular CSS masters might point to [classes that's applied to inputs when various state changes are made](https://angular.io/api/forms/NgControlStatus#css-classes-applied).

These classes include:


- `ng-pristine`
- `ng-dirty`
- `ng-untouched`
- `ng-touched`

They reflect states so that you can update the visuals in CSS to reflect them. When using `[(ngModel)]`, they won't appear, since nothing is tracking when a component is `pristine` or `dirty`. However, when using `[formControl]` or `[formControlName]`, these classes _will_ appear and act accordingly, thanks to the `registerOnChange` and `registerOnTouched` functions. As such, you're able to display custom CSS logic for when each of these states are met.

# Gain Access To Form Control Errors {#form-control-errors}

Something you'll notice that wasn't implemented in the `ControlValueAccessor` implementation is support for checking whether validators are applied. If you're a well-versed Angular Form-ite, you'll recall the ability to [validate forms using validators appended to `FormControl`s](https://angular.io/guide/form-validation). Although a niche situation — since most validation happens at the page level, not the component level — wouldn't it be nice to check when a form is valid or not directly from the component to which the form is attached?

Well, thanks to Angular's DI system, we can do just that!

However, we'll need to make a few changes to the form input [we made before](#forwardRef). While we previously implemented a provider for form controls, we now need to manually assign the provider ourselves in the constructor:

```typescript
import {
  Component,
  Input,
  ChangeDetectorRef,
  Optional,
  Self,
  AfterContentInit
} from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";

@Component({
  selector: "app-example-input",
  templateUrl: "./example-input.component.html",
  styleUrls: ["./example-input.component.css"]
})
export class ExampleInputComponent implements ControlValueAccessor, AfterContentInit {
  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private _changeDetector: ChangeDetectorRef
  ) {
    if (ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      ngControl.valueAccessor = this;
    }
  }
    
  // ...
}
```

In this code sample, we're using [the `@Self` decorator](https://angular.io/api/core/Self) to tell the dependency injection system that "this component _itself_ should have been provided a `formControl` or `formControlName`". However, we want the component to work even when `FormModule` isn't being used, so we allow the dependency injection to return `null` if nothing's passed by utilizing [the `@Optional` decorator](https://angular.io/api/core/Optional).

Now that you have the `ngControl`, you can access the `formControl` by using `ngControl.control`.

```typescript
ngOnInit() {
    const control = this.ngControl && this.ngControl.control;
    if (control) {
        console.log("ngOnInit", control);
        // FormControl should be available here
    }
}
```

You have [a ton of different props you're able to access for the control's metadata](https://angular.io/api/forms/NgControl). For example, if you want to check when errors are present, you can do the following:

```typescript
get errors() {
    const control = this.ngControl && this.ngControl.control;
    if (control) {
    	return control.touched && control.errors;
    }
    return null;
}
```

And then reference it in the template:

```html
<span class="inputLabel" [class.redtext]="errors">{{ placeholder }}</span>
```

Now that you have the component implementation, you can add validators to your `FormControl`:

```typescript
import { Component } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  control = new FormControl('', Validators.required);
}
```

<iframe data-frame-title="Angular Value Accessor Dep Inject - StackBlitz" src="pp-code:./angular-value-accessor-dep-inject?embed=1&file=src/app/app.component.ts" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>


Not only do you have [a wide range of Angular-built validators at your disposal](https://angular.io/api/forms/Validators), but you're even able to [make your own validator](https://angular.io/api/forms/Validator)!

# Conclusion {#conclusion}

Enabling `formControl` and `ngModel` usage is an extremely powerful tool that enables you to have feature-rich and consistent APIs across your form components. Using them, you can ensure that your consumers are provided with the functionality they'd expect in a familiar API to native elements. Hopefully, this article has provided you with more in-depth insight that you're able to use with your own components.

If you're interested in learning more about Angular, please sign up for our newsletter down below! We don't spam and will notify you when new Angular articles are live! Additionally, if you'd like to ask in-depth questions or chat about anything Angular related, don't forget to [join our Discord Server, where we talk code and more!](https://discord.gg/FMcvc6T)
