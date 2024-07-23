---
{
  title: "Accessing Children",
  description: "Oftentimes, when passing children to a component, you want a way to programmatically access that passed data. Let's learn how to do that in React, Angular, and Vue.",
  published: "2024-03-11T12:15:00.000Z",
  authors: ["crutchcorn"],
  tags: ["react", "angular", "vue", "webdev"],
  attached: [],
  order: 15,
  collection: "framework-field-guide-fundamentals",
}
---

In [our "Passing Children" chapter](/posts/ffg-fundamentals-passing-children), we talked about how you can pass components and elements as children to another component:

```jsx
<FileTableContainer>
	<FileTableHeader />
	<FileTableBody />
</FileTableContainer>
```

We also touched on the ability to access the following:

- [HTML Elements](/posts/ffg-fundamentals-element-reference)
- [Custom Components](/posts/ffg-fundamentals-component-reference)

But only when the respective HTML elements or components are inside the parent's template itself:

```jsx
// Inside FileTableContainer
<FileTableHeader />
<FileTableBody />
```

What if, instead, there was a way to access the children passed to an element through the slotted area one by one?

> Well, is there a way to do that?

Yes.

Let's start with a simple example: Counting how many children a component has.

# Counting a Component's Children {#counting-comp-children}

Let's count how many elements and components are being passed to our component:

<!-- ::start:tabs -->

## React

React has a built-in helper called `Children` that will help you access data passed as a child to a component. Using this `Children` helper, we can use the `toArray` method to create an array from `children` that we can then do anything we might otherwise do with a typical array.

This comes in handy when trying to access the `length` count.

```jsx
import { Children } from "react";

const ParentList = ({ children }) => {
	const childArr = Children.toArray(children);
	console.log(childArr); // This is an array of ReactNode - more on that in the next sentence
	return (
		<>
			<p>There are {childArr.length} number of items in this array</p>
			<ul>{children}</ul>
		</>
	);
};

const App = () => {
	return (
		<ParentList>
			<li>Item 1</li>
			<li>Item 2</li>
			<li>Item 3</li>
		</ParentList>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Counting Comp Children - StackBlitz" src="pp-code:./ffg-fundamentals-react-counting-comp-children-112?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

Here, `childArr` is an array of type `ReactNode`. A `ReactNode` is created by React's `createElement` method.

> Remember that JSX transforms to call React's `createElement` node under-the-hood.
>
> This means that the following JSX:
>
> ```jsx
> const el = <div />;
> ```
>
> Becomes the following code after compilation:
>
> ```javascript
> const el = createElement("div");
> ```

There also exists a `Children.count` method that we could use as an alternative if we wanted.

```jsx
const ParentList = ({ children }) => {
	const childrenLength = Children.count(children);
	return (
		<>
			<p>There are {childrenLength} number of items in this array</p>
			<ul>{children}</ul>
		</>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Counting Comp Children Util - StackBlitz" src="pp-code:./ffg-fundamentals-react-counting-comp-children-util-112?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

## Angular

To get the count of the children elements within a component in Angular requires some pre-requisite knowledge. Let's go through each step until we find ourselves at the solution.

### `ContentChild` to Access a Single Child {#content-child-access-single}

In [our "Dynamic HTML" chapter, we talked about how you're able to assign a "variable template variable" using a `#` syntax](/posts/ffg-fundamentals-dynamic-html#ng-template):

```html
<div #templVar></div>
```

In our previous example, we used them to conditionally render content using `ngIf`, but these template tags aren't simply useful in `ngIf` usage. We can also use them in a myriad of programmatic queries, such as [`ContentChild`](https://angular.io/api/core/ContentChild).

`ContentChild` is a way to query the projected content within [`ng-content`](/posts/ffg-fundamentals-passing-children) from JavaScript.

```angular-ts
import {
	Component,
	AfterContentInit,
	ContentChild,
	ElementRef,
} from "@angular/core";

@Component({
	selector: "parent-list",
	standalone: true,
	template: `<ng-content></ng-content>`,
})
class ParentListComponent implements AfterContentInit {
	@ContentChild("childItem") child!: ElementRef<HTMLElement>;

	// This cannot be replaced with an `OnInit`, otherwise `children` is empty. We'll explain soon.
	ngAfterContentInit() {
		console.log(this.child.nativeElement); // This is an HTMLElement
	}
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [ParentListComponent],
	template: `
		<parent-list>
			<p #childItem>Hello, world!</p>
		</parent-list>
	`,
})
class AppComponent {}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular ContentChild - StackBlitz" src="pp-code:./ffg-fundamentals-angular-contentchild-112?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

Here, we're querying for the template tag `childItem` within the project content by using [the `ContentChild` decorator](https://angular.io/api/core/ContentChild).

`ContentChild` then returns [a TypeScript generic type](/posts/typescript-type-generics) of `ElementRef`.

`ElementRef` is a type that has a single property called `nativeElement` containing the [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) in question.

### `ngAfterContentInit` Detects Child Initialization {#ngaftercontentinit-detects-child-init}

If you were looking at the last code sample and wondered:

> "What is `ngAfterContentInit` and why are we using it in place of `ngOnInit`?"

Then you're asking the right questions!

See, if we replace our usage of `ngAfterContentInit` with a `ngOnInit`, then we get `undefined` in place of `this.child`:

```angular-ts
@Component({
	selector: "parent-list",
	standalone: true,
	template: ` <ng-content></ng-content> `,
})
class ParentListComponent implements OnInit {
	@ContentChild("childItem") child!: ElementRef<HTMLElement>;

	ngOnInit() {
		console.log(this.child); // This is `undefined`
	}
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Why ngAfterContentInit? - StackBlitz" src="pp-code:./ffg-fundamentals-angular-why-ngaftercontentinit-112?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

This is because while `ngOnInit` runs after the component has rendered, it has not yet received any values within `ng-content`; this is where `ngAfterContentInit` comes into play. This lifecycle method runs once `ng-content` has received the values, which we can then use as a sign that `ContentChild` has finished its query.

This can be solved by either:

- Using `ngAfterContentInit` if the content is dynamic
- [Using `{static: true}` on the `ContentChild` decorator if the content is static](/posts/ffg-fundamentals-element-reference#using-static-true)

### Handle Multiple Children with `ContentChildren` {#content-children-access-multiple}

While `ContentChild` is useful for querying against a single item being projected, what if we wanted to query against multiple items being projected?

This is where [`ContentChildren`](https://angular.io/api/core/ContentChildren) comes into play:

```angular-ts
import {
	Component,
	AfterContentInit,
	ContentChildren,
	QueryList,
} from "@angular/core";

@Component({
	selector: "parent-list",
	standalone: true,
	template: `
		<p>There are {{ children.length }} number of items in this array</p>
		<ul>
			<ng-content></ng-content>
		</ul>
	`,
})
class ParentListComponent implements AfterContentInit {
	@ContentChildren("listItem") children!: QueryList<HTMLElement>;

	ngAfterContentInit() {
		console.log(this.children);
	}
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [ParentListComponent],
	template: `
		<parent-list>
			<li #listItem>Item 1</li>
			<li #listItem>Item 2</li>
			<li #listItem>Item 3</li>
		</parent-list>
	`,
})
class AppComponent {}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Counting Component Children - StackBlitz" src="pp-code:./ffg-fundamentals-angular-counting-component-children-112?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

`ContentChildren` returns an array-like [`QueryList`](https://angular.io/api/core/QueryList) generic type. You can then access the properties of `children` inside of the template itself, like what we're doing with `children.length`.

## Vue

Unlike React and Angular, Vue's APIs don't allow us to count a child's list items easily. There are a lot of nuances as to _why_ this is the case, but we'll do our best to explain that when we [rewrite Vue from scratch in the third book of the series](https://framework.guide).

Instead, you'll want to pass the list from the parent component to the list display to show the value you intend:

```vue
<!-- ParentList -->
<script setup>
const props = defineProps(["list"]);
</script>

<template>
	<p>There are {{ props.list.length }} number of items in this array</p>
	<ul>
		<slot></slot>
	</ul>
</template>
```

```vue
<!-- App.vue -->
<script setup>
import ParentList from "./ParentList.vue";

const list = [1, 2, 3];
</script>

<template>
	<ParentList :list="list">
		<li v-for="i in list">Item {{ i }}</li>
	</ParentList>
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Counting Component Children - StackBlitz" src="pp-code:./ffg-fundamentals-vue-counting-component-children-112?template=node&embed=1&file=src%2FApp.vue"></iframe>
<!-- ::end:no-ebook -->

<!-- Editor's note: While yes, we could do a `mounted() {this.$slots.children}` for THIS example, two things: 1) It's bad practice in that it will cause two renders. 2) It breaks in the very next code sample -->

<!-- Editors note: It breaks in the next sample because if you add `updated` to listen for changes, then call `this.$slots.default()`, it will trigger an infinite render since it will, in turn re-trigger `updated -->

<!-- Editor's note: While `$el` might seem like a viable alternative to an ID, it's not due to the fact that we have multiple root HTML nodes. This means that `$el` is a VNode, not an `HTMLElement`, and therefore does not have an `id` property -->

<!-- Editor's note: $slots.default doesn't work with `v-for` -->

<!-- ::end:tabs -->

# Rendering Children in a Loop {#rendering-children-in-loop}

Now that we're familiar with accessing children let's use the same APIs introduced before to take the following component template:

```html
<ParentList>
	<span>One</span>
	<span>Two</span>
	<span>Three</span>
</ParentList>
```

To render the following HTML:

```html
<ul>
	<li><span>One</span></li>
	<li><span>Two</span></li>
	<li><span>Three</span></li>
</ul>
```

<!-- ::start:tabs -->

## React

```jsx
const ParentList = ({ children }) => {
	const childArr = Children.toArray(children);
	console.log(childArr); // This is an array of ReactNode - more on that in the next sentence
	return (
		<>
			<p>There are {childArr.length} number of items in this array</p>
			<ul>
				{children.map((child) => {
					return <li>{child}</li>;
				})}
			</ul>
		</>
	);
};

const App = () => {
	return (
		<ParentList>
			<span style={{ color: "red" }}>Red</span>
			<span style={{ color: "green" }}>Green</span>
			<span style={{ color: "blue" }}>Blue</span>
		</ParentList>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Children in Loop - StackBlitz" src="pp-code:./ffg-fundamentals-react-children-in-loop-113?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

## Angular

Since Angular's `ContentChildren` gives us an `HTMLElement` reference when using our template variables on `HTMLElements`, we're not able to wrap those elements easily.

Instead, let's change our elements to `ng-template`s and render them in an `ngFor`, [similarly to what we did in our "Directives" chapter](/posts/ffg-fundamentals-directives#using-viewcontainer-to-render-a-template):

```angular-ts
@Component({
	selector: "parent-list",
	standalone: true,
	imports: [NgFor, NgTemplateOutlet],
	template: `
		<p>There are {{ children.length }} number of items in this array</p>
		<ul>
			<li *ngFor="let child of children">
				<ng-template [ngTemplateOutlet]="child" />
			</li>
		</ul>
	`,
})
class ParentListComponent {
	@ContentChildren("listItem") children!: QueryList<TemplateRef<any>>;
}

@Component({
	standalone: true,
	imports: [ParentListComponent],
	selector: "app-root",
	template: `
		<parent-list>
			<ng-template #listItem>
				<span style="color: red">Red</span>
			</ng-template>
			<ng-template #listItem>
				<span style="color: green">Green</span>
			</ng-template>
			<ng-template #listItem>
				<span style="color: blue">Blue</span>
			</ng-template>
		</parent-list>
	`,
})
class AppComponent {}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Children in Loop - StackBlitz" src="pp-code:./ffg-fundamentals-angular-children-in-loop-113?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

## Vue

Just as before, Vue's APIs have a limitation when accessing direct children. Let's explore _why_ [in the third book in our book series](https://framework.guide).

<!-- ::end:tabs -->

## Adding Children Dynamically {#adding-children-dynamically}

Now that we have a list of items being transformed by our component let's add the functionality to add another item to the list:

<!-- ::start:tabs -->

### React

```jsx
const ParentList = ({ children }) => {
	const childArr = Children.toArray(children);
	console.log(childArr);
	return (
		<>
			<p>There are {childArr.length} number of items in this array</p>
			<ul>
				{children.map((child) => {
					return <li>{child}</li>;
				})}
			</ul>
		</>
	);
};

const App = () => {
	const [list, setList] = useState([1, 42, 13]);

	const addOne = () => {
		// `Math` is built into the browser
		const randomNum = Math.floor(Math.random() * 100);
		setList([...list, randomNum]);
	};
	return (
		<>
			<ParentList>
				{list.map((item, i) => (
					<span key={i}>
						{i} {item}
					</span>
				))}
			</ParentList>
			<button onClick={addOne}>Add</button>
		</>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Adding Children Dynamically - StackBlitz" src="pp-code:./ffg-fundamentals-react-adding-children-dynamically-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

### Angular

```angular-ts
@Component({
	selector: "parent-list",
	standalone: true,
	imports: [NgFor, NgTemplateOutlet],
	template: `
		<p>There are {{ children.length }} number of items in this array</p>
		<ul>
			<li *ngFor="let child of children">
				<ng-template [ngTemplateOutlet]="child" />
			</li>
		</ul>
	`,
})
class ParentListComponent {
	@ContentChildren("listItem") children!: QueryList<TemplateRef<any>>;
}

@Component({
	standalone: true,
	imports: [ParentListComponent, NgFor],
	selector: "app-root",
	template: `
		<parent-list>
			<ng-template *ngFor="let item of list; let i = index" #listItem>
				<span>{{ i }} {{ item }}</span>
			</ng-template>
		</parent-list>
		<button (click)="addOne()">Add</button>
	`,
})
class AppComponent {
	list = [1, 42, 13];

	addOne() {
		const randomNum = Math.floor(Math.random() * 100);
		this.list.push(randomNum);
	}
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Adding Children Dynamically - StackBlitz" src="pp-code:./ffg-fundamentals-angular-adding-children-dynamically-114?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

### Vue

While Vue can't render children in a list, it has many more capabilities to showcase. Read on, dear reader.

<!-- ::end:tabs -->

Here, we can see that whenever a random number is added to the list, our list item counter still increments properly.

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of the Framework Field Guide." button-text="Sponsor my work" button-href="https://github.com/sponsors/crutchcorn/" -->

# Passing Values to Projected Content {#passing-values-to-projected-content}

While counting the number of items in a list is novel, it's not a very practical use of accessing projected content in JavaScript.

Instead, let's see if there's a way that we can pass values to our projected content. For example, let's try to change the background color of each `li` item if the index is even or odd.

<!-- ::start:tabs -->

## React

By now, we should be familiar with the `children` property in React. Now get ready to forget everything you know about it:

```jsx
const AddTwo = ({ children }) => {
	return 2 + children;
};

// This will display "7"
const App = () => {
	return <AddTwo children={5} />;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Numerical Child - StackBlitz" src="pp-code:./ffg-fundamentals-react-numerical-child-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

> WHAT?!

Yup — as it turns out, you can pass any JavaScript value to React's `children` prop. It even works when you write it out like this:

```jsx
const AddTwo = ({ children }) => {
	return 2 + children;
};

const App = () => {
	return <AddTwo>{5}</AddTwo>;
};
```

Knowing this, what happens if we pass a function as `children`?:

```jsx
const AddTwo = ({ children }) => {
	return 2 + children();
};

// This will display "7"
const App = () => {
	return <AddTwo>{() => 5}</AddTwo>;
	// OR <AddTwo children={() => 5} />
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Function Child - StackBlitz" src="pp-code:./ffg-fundamentals-react-function-child-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

Sure enough, it works!

Now, let's combine this knowledge with the ability to use JSX wherever a value might go:

```jsx
const ShowMessage = ({ children }) => {
	return children();
};

const App = () => {
	return <ShowMessage>{() => <p>Hello, world!</p>}</ShowMessage>;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Function JSX Child - StackBlitz" src="pp-code:./ffg-fundamentals-react-function-jsx-child-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

Finally, we can combine this with the ability to pass values to a function:

```jsx
const ShowMessage = ({ children }) => {
	return children("Hello, world!");
};

const App = () => {
	return <ShowMessage>{(message) => <p>{message}</p>}</ShowMessage>;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Function Child Pass Val - StackBlitz" src="pp-code:./ffg-fundamentals-react-function-child-pass-val-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

> Confused about how this last one is working? It might be a good time to [review your knowledge on how functions are able to pass to one another and call each other](/posts/javascript-functions-are-values).

### Displaying the List in React {#displaying-list-react}

Now that we've seen the capabilities of a child function, let's use it to render a list with alternating backgrounds:

```jsx
const ParentList = ({ children, list }) => {
	return (
		<>
			<ul>
				{list.map((item, i) => {
					return (
						<Fragment key={item}>
							{children({
								backgroundColor: i % 2 ? "grey" : "",
								item,
								i,
							})}
						</Fragment>
					);
				})}
			</ul>
		</>
	);
};

const App = () => {
	const [list, setList] = useState([1, 42, 13]);

	const addOne = () => {
		const randomNum = Math.floor(Math.random() * 100);
		setList([...list, randomNum]);
	};

	return (
		<>
			<ParentList list={list}>
				{({ backgroundColor, i, item }) => (
					<li style={{ backgroundColor: backgroundColor }}>
						{i} {item}
					</li>
				)}
			</ParentList>
			<button onClick={addOne}>Add</button>
		</>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Pass Val to Projected Content - StackBlitz" src="pp-code:./ffg-fundamentals-react-pass-val-to-projected-content-114?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

## Angular

Let's use the [ability to pass values to an ngTemplate using context](/posts/ffg-fundamentals-directives#passing-data-to-ng-template) to provide the background color to the passed template to our `ParentList` component:

```angular-ts
@Component({
	selector: "parent-list",
	standalone: true,
	template: `
		<p>There are {{ children.length }} number of items in this array</p>
		<ul>
			<ng-template
				*ngFor="let template of children; let i = index"
				[ngTemplateOutlet]="template"
				[ngTemplateOutletContext]="{ backgroundColor: i % 2 ? 'grey' : '' }"
			></ng-template>
		</ul>
	`,
})
class ParentListComponent {
	@ContentChildren("listItem", { read: TemplateRef }) children: QueryList<
		TemplateRef<any>
	>;
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [ParentListComponent],
	template: `
		<parent-list>
			<ng-template
				#listItem
				*ngFor="let item of list; let i = index"
				let-backgroundColor="backgroundColor"
			>
				<li [style]="{ backgroundColor }">{{ i }} {{ item }}</li>
			</ng-template>
		</parent-list>
		<button (click)="addOne()">Add</button>
	`,
})
class AppComponent {
	list = [1, 42, 13];

	addOne() {
		const randomNum = Math.floor(Math.random() * 100);
		this.list.push(randomNum);
	}
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Pass Val to Projected Content - StackBlitz" src="pp-code:./ffg-fundamentals-angular-pass-val-to-projected-content-114?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

## Vue

Vue ca... Wait! Vue _can_ do this one!

Let's take our code from the start of this chapter and refactor it so that we don't have to have our `v-for` inside of the `App.vue`. Instead, let's move it into `ParentList.vue` and pass properties to the `<slot>` element.

```vue
<!-- ParentList.vue -->
<script setup>
const props = defineProps(["list"]);
</script>

<template>
	<p>There are {{ props.list.length }} number of items in this array</p>
	<ul id="parentList">
		<slot
			v-for="(item, i) in props.list"
			:item="item"
			:i="i"
			:backgroundColor="i % 2 ? 'grey' : ''"
		></slot>
	</ul>
</template>
```

```vue
<!-- App.vue -->
<script setup>
import { ref } from "vue";
import ParentList from "./ParentList.vue";

const list = ref([1, 2, 3]);

function addOne() {
	const randomNum = Math.floor(Math.random() * 100);
	list.value.push(randomNum);
}
</script>

<template>
	<ParentList :list="list">
		<!-- Think of this as "template is receiving an object
		 we'll call props" from "ParentList" -->
		<template v-slot="props">
			<li :style="'background-color:' + props.backgroundColor">
				{{ props.i }} {{ props.item }}
			</li>
		</template>
	</ParentList>
	<button @click="addOne()">Add</button>
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Pass Val to Projected Content - StackBlitz" src="pp-code:./ffg-fundamentals-vue-pass-val-to-projected-content-114?template=node&embed=1&file=src%2FApp.vue"></iframe>
<!-- ::end:no-ebook -->

This `v-slot` is similar to how you might pass properties to a component, but instead, we're passing data directly to a `template` to be rendered by `v-slot`.

> You can [object destructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the `v-slot` usage to gain access to the property names without having to repeat `props` each time:
>
> ```html
> <template v-slot="{item, i}">
> 	<li>{{i}} {{item}}</li>
> </template>
> ```

<!-- ::end:tabs -->

# Challenge {#challenge}

Let's write a table component! Something like this:

| Heading One | Heading Two |
| ----------- | ----------- |
| Some val 1  | Some val 2  |
| Some val 3  | Some val 4  |
| Some val 5  | Some val 6  |

However, instead of having to write out the HTML ourselves, let's try to make this table easy to use for our development team.

Let's pass:

- An array of object data
- A table header template that receives the length of object data
- A table body template that receives the value for each row of data

This way, we don't need any loops in our `App` component.

<!-- ::start:tabs -->

## React

```jsx
const Table = ({ data, header, children }) => {
	const headerContents = header({ length: data.length });

	const body = data.map((value, rowI) => children({ value, rowI }));

	return (
		<table>
			<thead>{headerContents}</thead>
			<tbody>{body}</tbody>
		</table>
	);
};

const data = [
	{
		name: "Corbin",
		age: 24,
	},
	{
		name: "Joely",
		age: 28,
	},
	{
		name: "Frank",
		age: 33,
	},
];

function App() {
	return (
		<Table
			data={data}
			header={({ length }) => (
				<tr>
					<th>{length} items</th>
				</tr>
			)}
		>
			{({ rowI, value }) => (
				<tr>
					<td
						style={
							rowI % 2
								? { background: "lightgrey" }
								: { background: "lightblue" }
						}
					>
						{value.name}
					</td>
				</tr>
			)}
		</Table>
	);
}
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="React Accessing Children Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-react-accessing-children-challenge-115?template=node&embed=1&file=src%2Fmain.jsx"></iframe>

</details>

<!-- ::end:no-ebook -->

## Angular

```angular-ts
@Component({
	selector: "table-comp",
	standalone: true,
	imports: [NgFor, NgTemplateOutlet],
	template: `
		<table>
			<thead>
				<ng-template
					[ngTemplateOutlet]="header"
					[ngTemplateOutletContext]="{ length: data.length }"
				/>
			</thead>

			<tbody>
				<ng-template
					*ngFor="let item of data; let index = index"
					[ngTemplateOutlet]="body"
					[ngTemplateOutletContext]="{ rowI: index, value: item }"
				/>
			</tbody>
		</table>
	`,
})
class TableComponent {
	@ContentChild("header", { read: TemplateRef }) header!: TemplateRef<any>;
	@ContentChild("body", { read: TemplateRef }) body!: TemplateRef<any>;

	@Input() data!: any[];
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [TableComponent],
	template: `
		<table-comp [data]="data">
			<ng-template #header let-length="length">
				<tr>
					<th>{{ length }} items</th>
				</tr>
			</ng-template>
			<ng-template #body let-rowI="rowI" let-value="value">
				<tr>
					<td
						[style]="
							rowI % 2 ? 'background: lightgrey' : 'background: lightblue'
						"
					>
						{{ value.name }}
					</td>
				</tr>
			</ng-template>
		</table-comp>
	`,
})
class AppComponent {
	data = [
		{
			name: "Corbin",
			age: 24,
		},
		{
			name: "Joely",
			age: 28,
		},
		{
			name: "Frank",
			age: 33,
		},
	];
}
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="Angular Accessing Children Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-angular-accessing-children-challenge-115?template=node&embed=1&file=src%2Fmain.ts"></iframe>

</details>

<!-- ::end:no-ebook -->

## Vue

```vue
<!-- App.vue -->
<script setup>
import Table from "./Table.vue";

const data = [
	{
		name: "Corbin",
		age: 24,
	},
	{
		name: "Joely",
		age: 28,
	},
	{
		name: "Frank",
		age: 33,
	},
];
</script>

<template>
	<Table :data="data">
		<template #header="{ length }">
			<tr>
				<th>{{ length }} items</th>
			</tr>
		</template>
		<template v-slot="{ rowI, value }">
			<tr>
				<td
					:style="rowI % 2 ? 'background: lightgrey' : 'background: lightblue'"
				>
					{{ value.name }}
				</td>
			</tr>
		</template>
	</Table>
</template>
```

```vue
<!-- Table.vue -->
<script setup>
const props = defineProps(["data"]);
</script>

<template>
	<table>
		<thead>
			<slot name="header" :length="props.data.length"></slot>
		</thead>
		<tbody>
			<slot
				v-for="(item, i) in props.data"
				:key="i"
				:rowI="i"
				:value="props.data[i]"
			/>
		</tbody>
	</table>
</template>
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="Vue Accessing Children Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-vue-accessing-children-challenge-115?template=node&embed=1&file=src%2FApp.vue"></iframe>

</details>

<!-- ::end:no-ebook -->

<!-- ::end:tabs -->
