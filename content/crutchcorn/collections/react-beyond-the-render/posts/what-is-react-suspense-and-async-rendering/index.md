---
{
    title: "What is React Suspense and Async Rendering?",
    description: "Handling async code in React code has historically been fairly challenging to get right. Let's see how React's official solutions for promises stack up!",
    published: '2023-12-18T21:52:59.284Z',
    tags: ['react', 'webdev'],
    license: 'cc-by-4',
    collection: "react-beyond-the-render",
    order: 5
}
---

In our last article, I introduced React Server Components (RSC) as a primitive to enable more efficient server-side React usage.

I also hinted in the conclusion of that article that due to the nature of RSCs we'd be able to add on to our knowledge and utilize data fetching.

Let's talk about data fetching, first by putting server-side behavior to the side, then we'll reintroduce the server-APIs soon after.

To do this, I want to introduce you to three new APIs: the `use` Hook, the `<Suspense>` component, and Async React Server Components.

# What is the React `use` Hook?

The React `use` Hook enables you to load data asynchronously in your components where data fetching is mission-critical.

Let's say that you're in a traditional [client-side rendered](/posts/what-is-ssr-and-ssg#csr) app and want to fetch data from the server. If you're not using a library like [TanStack Query](https://tanstack.com/query/latest) (which you should be), you might have something like this:

```jsx
const [data, setData] = useState({
    loading: true,
    result: null,
    error: null,
});

// Please use TanStack Query
useEffect(() => {
    fetchUser()
        .then((serverData) => {
            setData({ error: null, loading: false, result: serverData });
        })
        .catch((err) => {
            setData({ error: err, loading: false, result: null });
        });
}, []);
```

<iframe data-frame-title="React use Hook - StackBlitz" src="pp-code:./react-use-hook?template=node&embed=1&file=src%2Fmain.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

While this works and `useEffect` _can_ be used this way, `useEffect` is not a built-in mechanism for asynchronous data loading. 

Instead, React 18.3 (in canary release at the time of writing) introduces a new Hook: [`use`](https://react.dev/reference/react/use).

This hook allows you to pass a promise to it to load data:

```jsx {1,3}
import {use, cache} from "react";

const UserDisplay = () => {
	const result = use(fetchUser());

	return <p>Hello {result.name}</p>;
};

// Without `cache`, a new instance of a promise would
// be returned to `use` on every render. That's bad.
const fetchUser = cache(() => {
	// ...
});
```

> Here, we're using `use` in tandem with [React's `cache` function to avoid having to run `useMemo` on `fetchUser`](/posts/explaining-reacts-cache-function).

Now React will treat the `result` as if it were not a promise, so that you can access properties and render them directly inside of your JSX. Effectively `use` acts as an `await` for promises in your client components.

> If your only objective is to load data on the client, I'd still highly suggest using [TanStack Query](https://tanstack.com/query/latest) or something similar. After all, even with `use` you likely want to take into consideration the following:
>
> - Caching results
> - Refetching with new inputs
> - Abort signals to avoid timing issues

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of articles like this." button-text="Visit our Open Collective" button-href="https://opencollective.com/unicorn-utterances" -->

# What is the `<Suspense>` component?

The React `<Suspense>` component allows you to add a loading state to your components needing to use asynchronous APIs; such as the new `use` Hook.

Take the `<UserDisplay>` component from before. To add a loading indicator to the `<UserDisplay>` component, add a `<Suspense>` component in the parent component alongside a `fallback={}` property:

```jsx
function App() {
	return (
        <Suspense fallback={<p>Loading...</p>}>
            <UserDisplay promise={promise} />
        </Suspense>
	);
}
```

<iframe data-frame-title="React Suspense - StackBlitz" src="pp-code:./react-suspense?template=node&embed=1&file=src%2Fmain.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## Reusing Loading Indicators

Loading indicators may be important to show in-progress data fetching, but users don't often like seeing a dashboard with 30 different loading spinners. 

Because of this, React has made handling multiple data sources easy using `<Suspense>`; just wrap multiple `use` Hook components inside of a single `<Suspense>` component:

```jsx
const UserDisplay = ({timeout}) => {
	const result = use(fetchUser({ timeout }));

	return <p>Hello {result.name}</p>;
};

function App() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<UserDisplay timeout={1500} />
			<UserDisplay timeout={3000} />
		</Suspense>
	);
}

// Pretend this is fetching data from the server
const fetchUser = cache(({ timeout }) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				name: "John Doe",
				age: 34,
			});
		}, timeout ?? 1000);
	});
});
```

<iframe data-frame-title="React Suspense Multi - StackBlitz" src="pp-code:./react-suspense-multi?template=node&embed=1&file=src%2Fmain.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

To sidestep this behavior, wrap each `<UserDisplay>` in their own `<Suspense>`:

```jsx
function App() {
	return (
		<>
            {/* Will show "Loading..." for 3 seconds while
                waiting for BOTH promises to resolve */}
			<Suspense fallback={<p>Loading...</p>}>
                <UserDisplay timeout={1500} />
			</Suspense>
            <Suspense fallback={<p>Loading...</p>}>
                <UserDisplay timeout={3000} />
			</Suspense>
		</>
	);
}
```

<iframe data-frame-title="React Suspense One-by-One - StackBlitz" src="pp-code:./react-suspense-one-by-one?template=node&embed=1&file=src%2Fmain.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

## How do I handle rejected promises in `<Suspense>`?

While `use` and `<Suspense>` handle resolved promises just fine, they alone will not handle rejected promises passed to the `use` Hook.

To handle rejected promises in Suspense, you'll need to use an `<ErrorBoundary>` class-based component which utilizes the `getDerivedStateFromError` lifecycle method. 

Let's see how we can do this ourselves:

```jsx
const UserDisplay = () => {
	const result = use(fetchUser());

	return <p>Hello {result.name}</p>;
};

function App() {
	return (
		<ErrorBoundary>
			<Suspense fallback={<p>Loading...</p>}>
				<UserDisplay />
			</Suspense>
		</ErrorBoundary>
	);
}

class ErrorBoundary extends Component {
	state = { error: null };

	static getDerivedStateFromError(error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			return <p>There was an error: {JSON.stringify(this.state.error)}</p>;
		}

		return this.props.children;
	}
}
```

<iframe data-frame-title="React Suspense Error Boundary - StackBlitz" src="pp-code:./react-suspense-error-boundary?template=node&embed=1&file=src%2Fmain.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

# Using `use` on the server

Now let's move back to server-land

We know that we can make server-only components, that don't reinitialize on the client, right? Now what if we could load the data on the server and not have it passed to the client either?

Well, luckily for us - we already have a mechanism for loading data in React that's async:

```tsx
const ServerComp = () => {
    /* This works, but is not the best way of doing
       things on the server */
    const data = use(fetchData())

    return <ChildComp data={data}/>
}

const Parent = () => {
    /* We don't need a Suspense component here, since
       the server will wait for the promise to resolve before
       sending data to the client */
    return <ServerComp/>;
}
```

Here, we're seeing an imaginary `ChildComp` rendered with data passed from the server - this data is never fetched on the client thanks to how [React Server Components](/posts/what-are-react-server-components) work.

But wait a moment - we're on the server. `use` accepts any promise... What if... What if we just polled our database directly?

```tsx
const ServerComp = () => {
    /* This also works, but is still not the best way
        of doing things in server components */
    const data = use(fetchOurUserFromTheDatabase())

    return <ChildComp data={data}/>
}

// Still using cache... For now...
const fetchOurUserFromTheDatabase = cache(() => {
    // ...
})
```

This works!

<iframe data-frame-title="Next.js use Hook - StackBlitz" src="pp-code:./nextjs-use-hook?template=node&embed=1&file=app%2Fpage.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

# What are React Async Server Components?

While `use` is undoubtably useful for client apps, server components have a better option available to us: async components.

Here, we mark our component as being `async` and simply `await` the promise function to resolve it prior to reaching our JSX:

```jsx
// No need for `cache`!
async function fetchOurUserFromTheDatabase() {
	// ...
};

async function UserDetails() {
  const user = await fetchOurUserFromTheDatabase();
  return <p>{user.name}</p>;
}
```

We can then use it as if it were any other server component:

```jsx
export default function Home() {
  return <UserDetails />;
}
```

<iframe data-frame-title="Next.js Async Components - StackBlitz" src="pp-code:./nextjs-async-components?template=node&embed=1&file=app%2Fpage.jsx" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

Not only is the developer experience for this component authoring better, but it's drastically more performant due to how its internals work.

> If that's the case why don't we use `async` components on the client as well?

According to the React team, [there are technical limitations around using async components on the client that make it infeasible to use on the client](https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md#why-cant-client-components-be-async-functions).

> **A note about async server components:**
> Something to keep in mind is that while normal React Server Components can use _some_ Hooks (`useId`, `useSearchParams`, etc) [async server components cannot use **any** hooks of any kind.](https://github.com/acdlite/rfcs/blob/first-class-promises/text/0000-first-class-support-for-promises.md#async-server-components-cannot-contain-hooks)

# Conclusion

In this article, we took a look at React's official solutions for async rendering behavior. This is great to see the team make strides
in this area; I think most apps are going to end up utilizing these heavily.

However, this is only half of the story for React's async support. Next up, we'll talk about React Server Actions, which enables the client to
make RPC-like calls back to the server and execute server code for us.

Can't wait to talk about what you learned about? [Join our Discord and tell us what you think about the Suspense API](https://discord.gg/FMcvc6T)!
