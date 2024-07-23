---
{
  title: "Derived Values",
  description: "Often in application development, you'll want to base one variable's value off of another. There are a few ways of doing this - some easier than others.",
  published: "2024-03-11T12:05:00.000Z",
  authors: ["crutchcorn"],
  tags: ["react", "angular", "vue", "webdev"],
  attached: [],
  order: 5,
  collection: "framework-field-guide-fundamentals",
}
---

We've previously touched on how to pass values to a component as properties earlier in the book:

<!-- ::start:tabs -->

# React

```jsx
const FileDate = ({ inputDate }) => {
	const [dateStr, setDateStr] = useState(formatDate(inputDate));
	const [labelText, setLabelText] = useState(formatReadableDate(inputDate));

	return <span aria-label={labelText}>{dateStr}</span>;
};
```

# Angular

```angular-ts
import { Component, OnInit } from "@angular/core";

@Component({
	selector: "file-date",
	standalone: true,
	template: `<span [attr.aria-label]="labelText">{{ dateStr }}</span>`,
})
class FileDateComponent implements OnInit {
	@Input() inputDate!: Date;

	dateStr = "";
	labelText = "";

	ngOnInit() {
		this.dateStr = this.formatDate(this.inputDate);
		this.labelText = this.formatReadableDate(this.inputDate);
	}

	// ...
}
```

# Vue

```vue
<!-- FileDate.vue -->
<script setup>
// ...

const props = defineProps(["inputDate"]);

const dateStr = ref(formatDate(props.inputDate));
const labelText = ref(formatReadableDate(props.inputDate));

// ...
</script>

<template>
	<span :aria-label="labelText">{{ dateStr }}</span>
</template>
```

<!-- ::end:tabs -->

You may notice that we're deriving two values from the same property. This works fine at first, but an issue arises with how we're doing things when we realize that our `formatDate` and `formatReadableDate` methods are only running once during the initial render.

Because of this, if we pass in an updated `inputDate` to the `FileDate` component, the values of `formatDate` and `formatReadableDate` will become out of sync from the parent's passed `inputDate`.

<!-- ::start:tabs -->

# React

```jsx
const File = ({ href, fileName, isSelected, onSelected, isFolder }) => {
	const [inputDate, setInputDate] = useState(new Date());

	useEffect(() => {
		// Check if it's a new day every 10 minutes
		const timeout = setTimeout(
			() => {
				const newDate = new Date();
				if (inputDate.getDate() === newDate.getDate()) return;
				setInputDate(newDate);
			},
			10 * 60 * 1000,
		);

		return () => clearTimeout(timeout);
	}, [inputDate]);

	// JSX shortened for focus
	// This may not show the most up-to-date `formatDate` or `formatReadableDate`
	return <FileDate inputDate={inputDate} />;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Refreshing File Date - StackBlitz" src="pp-code:./ffg-fundamentals-react-refreshing-file-date-45?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

# Angular

```angular-ts
@Component({
	selector: "file-item",
	standalone: true,
	imports: [FileDateComponent, NgIf],
	template: `
		<!-- ... -->
		<!-- This may not show the most up-to-date 'formatDate' or 'formatReadableDate' -->
		<file-date *ngIf="!isFolder" [inputDate]="inputDate" />
		<!-- ... -->
	`,
})
class FileComponent implements OnInit, OnDestroy {
	// ...
	inputDate = new Date();
	interval: any = null;

	ngOnInit() {
		// Check if it's a new day every 10 minutes
		this.interval = setInterval(
			() => {
				const newDate = new Date();
				if (this.inputDate.getDate() === newDate.getDate()) return;
				this.inputDate = newDate;
			},
			10 * 60 * 1000,
		);
	}

	ngOnDestroy() {
		clearInterval(this.interval);
	}
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Refreshing File Date - StackBlitz" src="pp-code:./ffg-fundamentals-angular-refreshing-file-date-45?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

# Vue

```vue
<!-- File.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import FileDate from "./FileDate.vue";

// ...

const inputDate = ref(new Date());
const interval = ref(null);

onMounted(() => {
	// Check if it's a new day every 10 minutes
	interval.value = setInterval(
		() => {
			const newDate = new Date();
			if (inputDate.value.getDate() === newDate.getDate()) return;
			inputDate.value = newDate;
		},
		10 * 60 * 1000,
	);
});

onUnmounted(() => {
	clearInterval(interval.value);
});
</script>

<template>
	<!-- ... -->
	<!-- This may not show the most up-to-date `formatDate` or `formatReadableDate` -->
	<FileDate v-if="isFolder" :inputDate="inputDate" />
	<!-- ... -->
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Refreshing File Date - StackBlitz" src="pp-code:./ffg-fundamentals-vue-refreshing-file-date-45?template=node&embed=1&file=src%2FFile.vue"></iframe>
<!-- ::end:no-ebook -->

<!-- ::end:tabs -->

While the above `File` component updates `inputDate` correctly, our `FileDate` component is never listening for the changed input value and, as such, never recomputed the `formatDate` or `formatReadableDate` value to display to the user.

How can we fix this?

# Method 1: Prop Listening {#prop-listening}

The first - and arguably easiest to mentally model - method to solve this disparity between prop value and display value is to simply listen for when a property's value has been updated and re-calculate the display value.

Luckily, we can use [our existing knowledge of side effects](/posts/ffg-fundamentals-side-effects) to do so:

<!-- ::start:tabs -->

## React

```jsx {5-9}
const FileDate = ({ inputDate }) => {
	const [dateStr, setDateStr] = useState(formatDate(inputDate));
	const [labelText, setLabelText] = useState(formatReadableDate(inputDate));

	useEffect(() => {
		setDateStr(formatDate(inputDate));
		setLabelText(formatReadableDate(inputDate));
		// Every time `inputDate` changes, it'll trigger a render and therefore call the `useEffect`
	}, [inputDate]);

	return <span aria-label={labelText}>{dateStr}</span>;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Prop Listening - StackBlitz" src="pp-code:./ffg-fundamentals-react-prop-listening-46?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

## Angular

While we didn't touch on this lifecycle method in our previous chapter, Angular has a lifecycle method specifically for when a component's props change: `ngOnChanges`.

We can use this new lifecycle method to update the value of a component's state based off of the parent's props:

```angular-ts {1,8,14-24}
import { Component, OnChanges, SimpleChanges } from "@angular/core";

@Component({
	selector: "file-date",
	standalone: true,
	template: `<span [attr.aria-label]="labelText">{{ dateStr }}</span>`,
})
class FileDateComponent implements OnChanges {
	@Input() inputDate: Date;

	dateStr = "";
	labelText = "";

	// Notice that we no longer need `ngOnInit`
	ngOnChanges(changes: SimpleChanges) {
		/**
		 * ngOnChanges runs for EVERY prop change. As such, we can
		 * restrict the recalculation to only when `inputDate` changes
		 */
		if (changes["inputDate"]) {
			this.dateStr = this.formatDate(this.inputDate);
			this.labelText = this.formatReadableDate(this.inputDate);
		}
	}

	// ...
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Prop Listening - StackBlitz" src="pp-code:./ffg-fundamentals-angular-prop-listening-46?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

## Vue

```vue {3,12-18}
<!-- FileDate.vue -->
<script setup>
import { ref, watch } from "vue";

// ...

const props = defineProps(["inputDate"]);

const dateStr = ref(formatDate(props.inputDate));
const labelText = ref(formatReadableDate(props.inputDate));

watch(
	() => props.inputDate,
	(newDate, oldDate) => {
		dateStr.value = formatDate(newDate);
		labelText.value = formatReadableDate(newDate);
	},
);
</script>

<template>
	<span :aria-label="labelText">{{ dateStr }}</span>
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Prop Listening - StackBlitz" src="pp-code:./ffg-fundamentals-vue-prop-listening-46?template=node&embed=1&file=src%2FFileDate.vue"></iframe>
<!-- ::end:no-ebook -->

Vue's `watch` logic allows you to track a given property or state value changes based on its key.

Here, we're watching the `inputDate` props key and, when changed, updating `dateStr` and `labelText` based off of the new property value.

<!-- ::end:tabs -->

While this method works, it tends to introduce duplicate developmental logic. For example, notice how we have to repeat the declaration of the `dateStr` and `labelText` values twice: Once when they're initially defined and again inside the property listener.

Luckily for us, there's an easy solution for this problem called "computed values."

# Method 2: Computed Values {#computed-values}

Our previous method of deriving a value from a property follows two steps:

1. Set an initial value
2. Update and recompute the value when its base changes

However, what if we could instead simplify this idea to a single step:

1. Run a function over a value and live update as it changes.

This may remind you of a similar pattern we've used already for [live updated text](/posts/ffg-fundamentals-intro-to-components#reactivity) and [attribute binding](/posts/ffg-fundamentals-intro-to-components#attr-binding).

Luckily for us, all three frameworks have a way of doing just this!

<!-- ::start:tabs -->

## React

```jsx {1,4-5}
import { useMemo } from "react";

const FileDate = ({ inputDate }) => {
	const dateStr = useMemo(() => formatDate(inputDate), [inputDate]);
	const labelText = useMemo(() => formatReadableDate(inputDate), [inputDate]);

	return <span aria-label={labelText}>{dateStr}</span>;
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Computed Values - StackBlitz" src="pp-code:./ffg-fundamentals-react-computed-values-47?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

`useMemo` is a method for computing values based on an input or series of inputs. This works because it does the computation and regenerates the calculation whenever the second argument array's values have changed in a render.

Like `useEffect`, this array's values' changes are only tracked when the component is rendered. Unlike `useEffect`, however, there's no option to remove the second array argument entirely.

Instead, if you want to recalculate the logic in every render, you'd remove the `useMemo` entirely. So, for simple computations, you can take this code:

```jsx
const AddComp = ({ baseNum, addNum }) => {
	const val = useMemo(() => baseNum + addNum, [baseNum, addNum]);
	return <p>{val}</p>;
};
```

And refactor it to look like this:

```jsx
const AddComp = ({ baseNum, addNum }) => {
	const val = baseNum + addNum;
	return <p>{val}</p>;
};
```

> While it's technically possible to use this trick to never use `useMemo`, your application's performance will suffer drastically. That said, it's a bit of a science to know when and where to use `useMemo`. [We'll touch on this more in our third book titled "Internals".](https://framework.guide)

## Angular

To solve the derived value problem without recomputing the values manually, Angular introduces the concept of a "pipe" into the mix of things. The idea is that a pipe runs over an input (or series of inputs), just like React's `useMemo`.

```angular-ts
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "formatDate", standalone: true })
class FormatDatePipe implements PipeTransform {
	transform(value: Date): string {
		return formatDate(value);
	}
}

@Pipe({ name: "formatReadableDate", standalone: true })
class FormatReadableDatePipe implements PipeTransform {
	transform(value: Date): string {
		return formatReadableDate(value);
	}
}
```

You may then use these pipes in your components directly inside the template.

```angular-ts
@Component({
	selector: "file-date",
	standalone: true,
	imports: [FormatReadableDatePipe, FormatDatePipe],
	template: `
		<span [attr.aria-label]="inputDate | formatReadableDate">
			{{ inputDate | formatDate }}
		</span>
	`,
})
class FileDateComponent {
	@Input() inputDate!: Date;
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Computed Values - StackBlitz" src="pp-code:./ffg-fundamentals-angular-computed-values-47?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

### Multiple Input Pipes {#multi-input-pipes}

You may notice the similarities between pipes and functions. After all, pipes are effectively functions you're able to call in your template. Much like functions, they're not limited to a single input property, either.

Let's add a second input to see if the `formatDate` pipe should return a readable date or not.

```angular-ts
@Pipe({ name: "formatDate", standalone: true })
class FormatDatePipe implements PipeTransform {
	// `dateFormat` is an optional argument. If left empty, will simply `formatDate`
	transform(value: Date, dateFormat?: string): string {
		// Stands for "Long format month, day of month, year"
		if (dateFormat === "MMMM d, Y") return formatReadableDate(value);
		return formatDate(value);
	}
}
```

Then, we can use it in our template while passing a second argument:

```angular-ts
@Component({
	selector: "file-date",
	standalone: true,
	imports: [FormatDatePipe],
	template: `
		<span [attr.aria-label]="inputDate | formatDate: 'MMMM d, Y'">
			{{ inputDate | formatDate }}
		</span>
	`,
})
class FileDateComponent {
	@Input() inputDate: Date;
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Multi Input Pipes - StackBlitz" src="pp-code:./ffg-fundamentals-angular-multi-input-pipes-47?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

### Built-In Pipes {#built-in-pipes}

Luckily, Angular's all-in-one methodology means that there's a slew of pipes that the Angular team has written for us. One such pipe is actually a date formatting pipe. We can remove our own implementation in favor of one built right into Angular!

To use the built-in pipes, we need to import them from `CommonModule` into the component. In this case, the pipe we're looking to use is called [`DatePipe`](https://angular.io/api/common/DatePipe). This provided date pipe is, expectedly, called `date` when used in the template and can be used like so:

```angular-ts
import { DatePipe } from "@angular/common";

@Component({
	selector: "file-date",
	standalone: true,
	imports: [DatePipe],
	template: `
		<span [attr.aria-label]="inputDate | date: 'MMMM d, Y'">
			{{ inputDate | date }}
		</span>
	`,
})
class FileDateComponent {
	@Input() inputDate!: Date;
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Built-In Pipes - StackBlitz" src="pp-code:./ffg-fundamentals-angular-built-in-pipes-47?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

## Vue

```vue {3,9-10}
<!-- FileDate.vue -->
<script setup>
import { computed } from "vue";

// ...

const props = defineProps(["inputDate"]);

const dateStr = computed(() => formatDate(props.inputDate));
const labelText = computed(() => formatReadableDate(props.inputDate));
</script>

<template>
	<span :aria-label="labelText">{{ dateStr }}</span>
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Computed Values - StackBlitz" src="pp-code:./ffg-fundamentals-vue-computed-values-47?template=node&embed=1&file=src%2FFileDate.vue"></iframe>
<!-- ::end:no-ebook -->

Instead of using `ref` to construct a set of variables and then re-initializing the values once we `watch` a `prop`, we can simply tell Vue to do that same process for us using `computed` props.

<!-- ::start:no-ebook -->

Vue is able to ✨ magically ✨ detect what data inside the `computed` function is dynamic, just like `watchEffect`. When this dynamic data is changed, it will automatically re-initialize the variable it's assigned to with a new value returned from the inner function.

<!-- ::end:no-ebook -->

<!-- ::start:only-ebook -->

Vue is able to magically detect what data inside the `computed` function is dynamic, just like `watchEffect`. When this dynamic data is changed, it will automatically re-initialize the variable it's assigned to with a new value returned from the inner function.

<!-- ::end:only-ebook -->

These `computed` props are then accessible in the same way a `data` property is, both from the template and from Vue's `<script>` alike.

<!-- ::end:tabs -->

# Non-Prop Derived Values {#non-derived-vals}

While we've primarily used component inputs to demonstrate derived values today, both of the methods we've used thus far work for the internal component state and inputs.

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of the Framework Field Guide." button-text="Sponsor my work" button-href="https://github.com/sponsors/crutchcorn/" -->

Let's say that we have a piece of state called `number` in our component and want to display the doubled value of this property without passing this state to a new component:

<!-- ::start:tabs -->

## React

```jsx
const CountAndDoubleComp = () => {
	const [number, setNumber] = useState(0);
	const doubleNum = useMemo(() => number * 2, [number]);

	return (
		<div>
			<p>{number}</p>
			<p>{doubleNum}</p>
			<button onClick={() => setNumber(number + 2)}>Add one</button>
		</div>
	);
};
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="React Non-Prop Derived - StackBlitz" src="pp-code:./ffg-fundamentals-react-non-prop-derived-48?template=node&embed=1&file=src%2Fmain.jsx"></iframe>
<!-- ::end:no-ebook -->

## Angular

```angular-ts
@Pipe({ name: "doubleNum", standalone: true })
class DoubleNumPipe implements PipeTransform {
	transform(value: number): number {
		return value * 2;
	}
}

@Component({
	selector: "count-and-double",
	standalone: true,
	imports: [DoubleNumPipe],
	template: `
		<div>
			<p>{{ number }}</p>
			<p>{{ number | doubleNum }}</p>
			<button (click)="addOne()">Add one</button>
		</div>
	`,
})
class CountAndDoubleComponent {
	number = 0;

	addOne() {
		this.number++;
	}
}
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Angular Non-Prop Derived - StackBlitz" src="pp-code:./ffg-fundamentals-angular-non-prop-derived-48?template=node&embed=1&file=src%2Fmain.ts"></iframe>
<!-- ::end:no-ebook -->

## Vue

```vue
<!-- CountAndDouble.vue -->
<script setup>
import { ref, computed } from "vue";

const number = ref(0);

function addOne() {
	number.value++;
}

const doubleNum = computed(() => number.value * 2);
</script>

<template>
	<div>
		<p>{{ number }}</p>
		<p>{{ doubleNum }}</p>
		<button @click="addOne()">Add one</button>
	</div>
</template>
```

<!-- ::start:no-ebook -->
<iframe data-frame-title="Vue Non-Prop Derived - StackBlitz" src="pp-code:./ffg-fundamentals-vue-non-prop-derived-48?template=node&embed=1&file=src%2FCountAndDouble.vue"></iframe>
<!-- ::end:no-ebook -->

<!-- ::end:tabs -->

In this component, we can see two numbers — one doubling the value of the other. We then have a button that allows us to increment the first number, and therefore, using a derived value, the second number also updates.

# Challenge {#challenge}

While building through our continued file hosting application, let's think through how our `Size` can be calculated to be displayed in the UI like so:

![A table of files and folders with "Name", "LAst modified", "Type", and "Size" headings](../ffg-fundamentals-passing-children/file_list.png)

File sizes are usually measured in how many bytes it takes to store the file. However, this isn't exactly useful information past a certain size. Let's instead use the following JavaScript to figure out how large a file size is, given the number of bytes:

```javascript
const kilobyte = 1024;
const megabyte = kilobyte * 1024;
const gigabyte = megabyte * 1024;

function formatBytes(bytes) {
	if (bytes < kilobyte) {
		return `${bytes} B`;
	} else if (bytes < megabyte) {
		return `${Math.floor(bytes / kilobyte)} KB`;
	} else if (bytes < gigabyte) {
		return `${Math.floor(bytes / megabyte)} MB`;
	} else {
		return `${Math.floor(bytes / gigabyte)} GB`;
	}
}
```

> Fun code challenge for you at home — can you write the above in fewer lines of code? 🤔

With this JavaScript, we can use a derived value to display the relevant display size. Let's build this out using a dedicated `DisplaySize` component:

<!-- ::start:tabs -->

## React

```jsx
function DisplaySize({ bytes }) {
	const humanReadableSize = useMemo(() => formatBytes(bytes), [bytes]);
	return <p>{humanReadableSize}</p>;
}

const kilobyte = 1024;
const megabyte = kilobyte * 1024;
const gigabyte = megabyte * 1024;

function formatBytes(bytes) {
	if (bytes < kilobyte) {
		return `${bytes} B`;
	} else if (bytes < megabyte) {
		return `${Math.floor(bytes / kilobyte)} KB`;
	} else if (bytes < gigabyte) {
		return `${Math.floor(bytes / megabyte)} MB`;
	} else {
		return `${Math.floor(bytes / gigabyte)} GB`;
	}
}
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="React Derived Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-react-derived-challenge-49?template=node&embed=1&file=src%2Fmain.jsx"></iframe>

</details>

<!-- ::end:no-ebook -->

## Angular

```angular-ts
@Pipe({ name: "formatBytes", standalone: true })
class FormatBytesPipe implements PipeTransform {
	kilobyte = 1024;
	megabyte = this.kilobyte * 1024;
	gigabyte = this.megabyte * 1024;

	transform(bytes: number): string {
		if (bytes < this.kilobyte) {
			return `${bytes} B`;
		} else if (bytes < this.megabyte) {
			return `${Math.floor(bytes / this.kilobyte)} KB`;
		} else if (bytes < this.gigabyte) {
			return `${Math.floor(bytes / this.megabyte)} MB`;
		} else {
			return `${Math.floor(bytes / this.gigabyte)} GB`;
		}
	}
}

@Component({
	selector: "display-size",
	standalone: true,
	imports: [FormatBytesPipe],
	template: `<p>{{ bytes | formatBytes }}</p>`,
})
class DisplaySizeComponent {
	@Input() bytes!: number;
}
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="Angular Derived Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-angular-derived-challenge-49?template=node&embed=1&file=src%2Fmain.ts"></iframe>

</details>

<!-- ::end:no-ebook -->

## Vue

```vue
<!-- DisplaySize.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps(["bytes"]);
const humanReadableSize = computed(() => formatBytes(props.bytes));

const kilobyte = 1024;
const megabyte = kilobyte * 1024;
const gigabyte = megabyte * 1024;

function formatBytes(bytes) {
	if (bytes < kilobyte) {
		return `${bytes} B`;
	} else if (bytes < megabyte) {
		return `${Math.floor(bytes / kilobyte)} KB`;
	} else if (bytes < gigabyte) {
		return `${Math.floor(bytes / megabyte)} MB`;
	} else {
		return `${Math.floor(bytes / gigabyte)} GB`;
	}
}
</script>

<template>
	<p>{{ humanReadableSize }}</p>
</template>
```

<!-- ::start:no-ebook -->

<details>

<summary>Final code output</summary>

<iframe data-frame-title="Vue Derived Challenge - StackBlitz" src="pp-code:./ffg-fundamentals-vue-derived-challenge-49?template=node&embed=1&file=src%2FDisplaySize.vue"></iframe>

</details>

<!-- ::end:no-ebook -->

<!-- ::end:tabs -->
