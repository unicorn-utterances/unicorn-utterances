---
{
	title: "Explaining Promises, Async, and Await in JavaScript",
	description: "Modern JavaScript is built on promises and callbacks. Let's learn what promises are and how we can make their usage easier using async functions.",
	published: '2024-03-15T13:45:00.284Z',
	tags: ['javascript', 'webdev'],
	license: 'cc-by-nc-sa-4'
}
---

When using JavaScript, you'll likely to've run into a function like `fetch` that doesn't pass you a value immediately.

```javascript
const res = fetch("example.com/something");
   // ^? Promise<"pending">
```

If you try to rely on the value returned from `fetch` without anything else; you'll likely run into something you won't expect:

```javascript
const json = res.json();
// VM303:1 Uncaught TypeError: res.json is not a function
```

This is because `res` is a `Promise`, which does not have a `json` method on it. It isn't unless you do:

```javascript
fetch("example.com/something")
    .then(res => res.json());
```

Or:

```javascript
const res = await fetch("example.com/something");
const json = res.json();
```

That you'll see the JSON returned from this endpoint.

Why is this? What is `.then` or `await` doing? Are they interchangeable?

Let's dive in and explain more.

# Sync and Async Values

Let's take a step back for a moment and talk about sync and async functions. 

Look at the following code that's written to add up as many numbers as you pass:

```javascript
function sumNumbers(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

const sum = sumNumbers([1, 2, 3]);
   // ^? 6
```

Here, `sum` is assigned the number of `6` from `sumNumbers`. This type of code is known as `synchronous` code; meaning that it runs each line of code sequentially until the execution of the code is finished.

For example, you don't have to use any kind of special syntax to tell the `for` loop that you want to wait for the next value. It runs each items in the for loop one-by-one:

```javascript
function logEachItem(items) {
  for (let i = 0; i < items.length; i++) {
    console.log(items[i]);
  }
}

/**
 * This will always log `1`, then `2`, then `3`
 * Because the `for` loop is sequential, 
 * it runs the same order every time
 */
logEachItem([1, 2, 3]);
```

This is often the default for many functions in JavaScript.

But every now and then this type of code becomes a problem when you remember that [JavaScript is single-threaded](https://www.youtube.com/watch?v=8aGhZQkoFbQ), and that expensive synchronous code can block the main thread.

When the main thread is blocked, it means a few things for your users: 

- The user can't select text
- The user can't type into a text area or text input
- Any other interactivity is blocked

We can see this behavior when the main thread is blocked on [the Playful Programming homepage](https://playfulprogramming.com):

<video src="./blocked_main_thread.mp4" title="A user trying to interact with the UU homepage, leading to none of the mouse interactions working out"></video>

>  So how can you accidentally block the main thread?

Let's say we take the previous `logEachItem` function and apply it over a massive array with a length of `300,000` items:

```javascript
function logEachItem(items) {
  for (let i = 0; i < items.length; i++) {
    console.log(items[i]);
  }
}

const items = Array.from({length: 300000}, (_, i) => i);
logEachItem(items)
```

While adding these numbers might not block the main thread, any I/O operation is fairly expensive comparatively; which leads to this usage blocking the main thread.

This isn't inherently unique to I/O operations, however; you can block the main thread with any sufficiently expensive synchronous code.

## Async Operations

Now assume we have the following implementation of `sleep`, which forces our codebase to wait a certain number of seconds:

```javascript
function sleep(seconds) {
  setTimeout(() => {
		// How do we know when this timer is done?
  }, seconds * 1000);
}
```

Were this `setTimeout` function synchronous, it would prevent the user from interacting with your homepage for however long you asked to wait.

But instead, if we run `sleep` in our code, you'll notice that other code is able to execute before the `setTimeout` finished:

```javascript
sleep(1000)
console.log("I am running before the setTimeout is done");
```

So then how can we tell our code that `sleep` is done and it should execute the next line of code?

There're two ways to do this:

- Callbacks
- Promises

## Callbacks

If we piggy-back off of [the idea that you can pass a function to another function](/posts/javascript-functions-are-values), we can make it so that you pass a function that's called when the `setTimeout` is done executing:

```javascript
function sleep(callback, seconds) {
  setTimeout(() => {
    callback();
  }, seconds * 1000);
}

sleep(() => {
  console.log("The sleep is finished");
}, 1)
```

This is how older JavaScript APIs functioned due to its intuitive nature, but comes with some flaws; Namely when you want to compose multiple `sleep`s one-by-one:

````javascript
sleep(() => {
    sleep(() => {
        sleep(() => {
            sleep(() => {
                sleep(() => {
                    sleep(() => {
                        sleep(() => {
                            sleep(() => {
                                sleep(() => {
                                    sleep(() => {
                                        console.log("10 seconds have passed")
                                    }, 1)
                                }, 1)
                            }, 1)
                        }, 1)
                    }, 1)
                }, 1)
            }, 1)
        }, 1)
    }, 1)
}, 1)
````

This is the biggest problem with callbacks; it leads to multiple chained items leading to a nested structure colloquially called a "Christmas Tree".

To solve this, we can reach for promises to handle the async nature of `sleep`.

## Async Promises

Luckily for us, JavaScript introduced a primitive to handle async code in 2015 called a "Promise".

You can create a promise like so:

```javascript
const promise = new Promise((resolve, reject) => {
	resolve();
  // or
  reject();
})

// Alternatively:

const fulfilledPromise = Promise.resolve()

const rejectedPromise = Promise.reject();
```

A promise can have one of three potential states:

- Pending - The promise has not yet "settled" to being "fulfilled" or "rejected"
- Fulfilled - The promise has successfully resolved a value
- Rejected - The promise has thrown an error which rejected the promise

A promise-based `sleep` function might look something like this:

```javascript
function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);    
  })
}

sleep(1)
  .then(resolvedValue => {
    console.log("The sleep is finished");
	})
	.catch(rejectedError => {
  	console.error("The sleep had an error")
	})
```

Here, we're using `.then` and `.catch` to handle the success and failure states from the promise. We can even gather the value resolved inside of the `.then` and the rejected value inside of `.catch`.

`.then` is also able to chain together to handle a promise returned from a previous `.then` state:

```javascript
sleep(1)
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
	.then(() => sleep(1))
  .then(() => {
    console.log("The sleep is finished");
	})

```

> Wow! There's no more Christmas Tree effect!

That's right! Now we can chain these promises and avoid the headaches that callbacks can cause.

## Async Functions and the Await Keyword

Now that we understand promises, let's explore two nice addons to promises that were made in 2017:

- Async functions 
- The `await` keyword

Using these, your ability to use promises is made even easier.

Let's start with the async function:

## Async Functions

The most simple usage of an async function is by wrapping any normal function in `async`:

```javascript
async function returnNumber() {
	return 123;
}

const promise = returnNumber();
   // ^? Promise<"pending">
```

Here, the behavior of `returnNumber` hasn't changed with one minor exception:

**Any value returned from an async function is automatically marked as a promise**.

This means that you can now add `.then` to our `returnNumber` like so:

```javascript
async function returnNumber() {
	return 123;
}

returnNumber()
  .then(num => console.log(num));
```

While the ability to return a promise quickly and easily is nice, it isn't the main superpower of `async` functions.

## `await` keyword

The main utility of the `async` function is its ability to use an `await` on an existing promise. Let's go back to our `sleep` function and demonstrate its use within an `async` function:

```javascript
function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);    
  })
}

async function main() {
  await sleep(1);
  console.log("One second has passed");
  await sleep(1);
  console.log("Two seconds have passed");
}
```

This is functionally equivalent to:

```javascript
function main() {
  return sleep(1)
  	.then(() => {
      console.log("One second has passed");
      return sleep(1);    
	  })
  	.then(() => {
	    console.log("Two seconds have passed");  
	  })
}
```

But with a much more readable syntax.

### Error Handling with `await`

>  Manually handling promises allows us to use the `.catch` handle to catch rejected promises, but how do we do this with `await`?

Well, we can use the classic `try/catch` to handle rejected errors in `await` usage:

```javascript
async function main() {
  try {
		await Promise.reject("There was an error");
  } catch (e) {
    console.error(e);
  }
}
```

Without this, the rejected promise will bubble up past `main` and into whatever was used to call `main`; which can cause a ton of problems on its own.

> **Note:**
> Remember to handle errors in `async` functions like you would elsewhere. Resilient code is good code!

## `await` usage mistakes

It's important to note that you're only able to use `await` inside of a function marked as `async`:

```javascript
// ✅ Good
async function fn() {
	await sleep(1);
}

// ✅ Good
const fn = async () => {
	await sleep(1);
}

// ❌ Bad
const fn = () => {
	await sleep(1);
}

// ❌ Bad
function fn() {
	await sleep(1);
}
```

If you try to use `await` inside of a non-async function, you'll get the error:

```
Uncaught SyntaxError: await is only valid in async functions and the top level bodies of modules
```

To fix this, wrap your functions that use `await` in an `async` keyword.

## Mix and match `async` and `new Promise`

As you may have caught onto; you're able to implicitly mix and match `async` functions, the `await` keyword, `new Promise` construction, and `.then`.

To showcase this, let's create a code sample that does just that:

```javascript
function fetchItems() {
  return fetch("https://example.com/items")
  	.then(res => res.ok ? Promise.resolve(res) : Promise.reject(res))
  	.then((res) => res.json())
}

async function loadList() {
  // Default to an empty array if there is an error;
  const list = await fetchItems()
  	.catch(err => {
      console.warn(err);
      // This resolves as a fulfilled promise now
      return [];
    });

  // Wait a second since `example.com` is too fast
  // And our users are suspicious without a loading spinner
 	await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000)
  });
  
  return list;
}

let loading = true;
loadList.then((list) => {
  loading = false;
  console.log("The list is", list)
})
.catch((err) => {
    loading = false;
})
```

# Conclusion

That's all for today! There's so much more to learn about promises that we'll explore in the future. This will include:

- Methods of concurrent promise running: 
  - `Promise.all`
  - `Promise.allSettled`
  - `Promise.any`
  - `Promise.race`
- Async function generators:
  - `for await (const item of list)`
  - `async function*`

And more!

In the meantime if this article caught your attention, consider [joining our Discord](https://discord.gg/FMcvc6T) to ask more questions and hang out with like-minded engineers ready to help with any engineering problems you might have.
