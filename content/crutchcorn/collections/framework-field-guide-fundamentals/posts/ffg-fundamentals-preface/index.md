---
{
  title: "Preface",
  description: "Learning web development is a vital skill in a software engineer's toolbox. Let's talk about why you should learn it and what this book will cover.",
  published: "2024-03-11T12:01:00.000Z",
  authors: ["crutchcorn"],
  tags: ["react", "angular", "vue", "webdev"],
  attached: [],
  order: 1,
  collection: "framework-field-guide-fundamentals",
}
---

Welcome to the first Framework Field Guide book titled "Fundamentals." This book is the culmination of a nearly 10-year-long professional software development career. It's also been over two years of writing, editing, and polishing, and is the first of what will be a trilogy of books teaching frontend web development.

This series will teach you how to build applications, the concepts under the hood of modern web frameworks, and the advanced coding patterns to help you level up your engineering.

While other resources can help you learn these concepts for one framework at a time, **this series will help you learn three different frameworks at once: React, Angular, and Vue.**

Namely, we'll be looking at the most modern iterations of these frameworks: React 18, Angular 17, and Vue 3.

> It's worth mentioning that React and Angular iterate their major versions much more frequently than Vue. So if you're reading this in the future and see "Angular 24" or "React 22," it's likely that it's using similar concepts under the hood.

We can do this because, despite being different in many ways, these frameworks share the same foundational ideas that run the show in any modern application. That's not to say they are the same, however, and because of this, I will take the time to take asides for each framework to explain where they differ and how they work under the hood individually.

By the end of this series, you should be able to confidently navigate any codebase using these frameworks.

But I'm getting ahead of myself; first, let's answer some fundamental questions.

# Why Should I Learn Web Development Today? {#why-learn-webdev}

Learning web development is a vital skill in software engineering. Even if you don't end up working on web tech yourself, the likelihood of a project eventually using web tech is exceptionally high. Knowing and understanding the limitations of a web's frontend can:

- Make Communicating with those teams simpler.
- Make structuring effective backend APIs easier.
- Allow you to transfer that knowledge to other UI development.

What's more, there's an absolutely gargantuan job market. To quote [the U.S. Bureau of Labor Statistics](https://web.archive.org/web/20211231182416/https://www.bls.gov/ooh/computer-and-information-technology/home.htm):

> Employment in computer and information technology occupations is projected to grow 13 percent from 2020 to 2030, faster than the average for all occupations. These occupations are projected to add about 667,600 new jobs.
>
> \[...]
>
> **The median annual wage for computer and information technology occupations was $91,250 in May 2020**.

While this number may be specific to the U.S., and other countries and markets may have different rates, programming tends to be a good bet for a sustainable long-term career.

## Why Should I Learn These Tools? {#why-learn-these-tools}

While web development is broadly helpful to learn as a skill for work in engineering, these frameworks, in particular, are a considerable boon to learn.

### Ecosystem Size {#ecosystem-size}

For starters, these tools are massively adopted. [React, Angular, and Vue account for 9% of the web in 2021](https://almanac.httparchive.org/en/2021/javascript#libraries-usage) and are consistently growing. While that might not sound like much, remember that [there are over 1.9 billion websites as of 2022](https://web.archive.org/web/20240210190759/https://www.internetlivestats.com/total-number-of-websites/); Even 1% accounts for nearly 10 million sites.

For example, React accounts for 17 million weekly downloads from NPM alone and powers Meta's products (including Facebook, Instagram, and Messenger). In addition, React is used by a vast quantity of companies; everyone from Fortune 500s to hot startups is using React in some capacity.

Likewise, while smaller, Angular is alive and well today (unlike its eerily similarly named yet distinct predecessor, "AngularJS"). Angular gains over two million downloads a week from NPM and powers sites such as Microsoft's Xbox website, Office Web Home site, Google's Voice website, Messages site, Firebase's dashboard, and many, many, many more.

Finally, Vue has gained rapid growth in the last few years. From [gaining 50 million downloads in 2019 to over 125 million in 2022 on NPM](https://npm-stat.com/charts.html?package=vue&from=2019-01-01&to=2021-12-31), it's seen staggering success in the ecosystem. What's more, Vue sees uniquely high levels of adoption in China. Among the adopters of Vue in China are [Alibaba, a major shopping site](https://madewithvuejs.com/alibaba), and [Bilibili, a video-sharing platform](https://madewithvuejs.com/bilibili).

### Ecosystem Tools {#ecosystem-tools}

While ecosystem size is great and all, it's nothing without a swath of tools at your disposal to enhance the developer experience and capabilities of said frameworks.

Luckily, for all three frameworks alike, myriads of tools build upon their foundation.

For example, do you want to add [Static Site Generation or Server Side Rendering](https://playfulprogramming.com/posts/what-is-ssr-and-ssg) to your projects to enhance SEO? No problem: React has [Next.js](https://nextjs.org/) and [Gatsby](https://gatsbyjs.com/), Angular has [Angular Universal](https://angular.io/guide/universal) and [Analog](https://analogjs.org/), and Vue has [NuxtJS](https://nuxtjs.org/) and [VuePress](https://vuepress.vuejs.org/).

Want to add a router to add multiple pages to your apps? React has the ["React Router"](https://reactrouter.com/), [Angular has its built-in router](https://angular.io/guide/router), and Vue has the ["Vue Router"](https://router.vuejs.org/).

Do you want to add global state management, making sharing data across an entire app easier? React has [Redux](https://redux.js.org/), Angular has [NgRx](https://ngrx.io/), and Vue has [Vuex](https://vuex.vuejs.org/).

The list of lists goes on and on. What's better is that the list I gave for each is non-comprehensive!

In fact, while these frameworks are traditionally associated with the web with the browser, there are even ecosystem tools that allow you to embed Angular, React, or Vue into mobile and native applications.

These tools include [ElectronJS](https://www.electronjs.org/) and [Tauri](https://github.com/tauri-apps/tauri) for desktop applications, alongside [React Native](https://reactnative.dev/) and [NativeScript](https://nativescript.org/) for mobile. While React Native only supports React, the other options I mentioned support the three frameworks we'll touch on.

While this book, in particular, will not touch on most of the ecosystem, the second book in our trilogy will be titled "Ecosystem." "Ecosystem" will teach you how to integrate the foundation of knowledge this book introduces to build out more complex applications with these community tools.

## Who's Building What? {#framework-owners}

This isn't to say that the only reason these tools will stick around is because they're popular; each of these frameworks has at least one prominent backer behind them.

React is built by Meta and powers all of its major applications. Moreover, the core team has started to accept external contributions through feedback on the framework's development via ["working groups" consisting of subject-matter experts](https://github.com/reactwg). In recent years, even [groups like Vercel have hired React core members to work on the project from outside of Meta](https://twitter.com/sebmarkbage/status/1470761453091237892).

However, when most mention "React," they tend to talk about the React ecosystem at large. See, the core maintainers of React itself tend to remain focused on a small subsection of tooling. Instead, they rely on external groups, like [Remix](https://remix.run/) and [Vercel](https://vercel.com/), to provide libraries that are often integral to application development.

On the other hand, Angular is fully funded and supported by Google. They build a substantial portion of their major websites on top of the framework and, as a result, have a vested interest in continuing and up-keeping development. Continuing the differences from React, the Angular core team maintains a slew of helper libraries that provide everything from an [HTTP call layer](https://angular.io/guide/http) to [form validation](https://angular.io/guide/forms-overview).

Vue is often seen as the odd one out when talking about funding. Vue's development is driven by an independent team crowd-funded by a diverse pool of groups and individuals. However, while it's unclear how much money they bring in, it is clear that there are significant-sized financial contributors involved, [such as Alibaba, Baidu, Xiaomi, and more](https://medium.com/the-vue-point/the-state-of-vue-1655e10a340a).

Like Angular, the Vue core team consists of groups working on a broad tooling set. Everything from [the official routing library](https://router.vuejs.org/) to its two different global store libraries ([Vuex](https://vuex.vuejs.org/) and [Pinia](https://pinia.vuejs.org/)) and beyond are considered part of Vue's core.

### Why Learn All Three Frameworks? {#why-learn-all-three}

While the obvious answer is "it broadens the types of work you're able to do," there are many reasons to learn more than one framework at a time.

In particular, each framework has its own restrictions, rules, and best practices. These rules and restrictions can help you understand a different way of coding that often transfers to other frameworks.

For example, Angular focuses on object-oriented programming, while the React ecosystem favors functional programming. While what each of these means is not immediately important, they allow you to do many of the same things in different ways and have other pros and cons.

Because of this, once you have mastered each, you can choose which programming methodology you want to apply within parts of your applications.

<!-- ::in-content-ad title="Consider supporting" body="Donating any amount will help towards further development of the Framework Field Guide." button-text="Sponsor my work" button-href="https://github.com/sponsors/crutchcorn/" -->

Beyond this, it's important to remember that these three frameworks are not the only choices on the table in web development. Svelte is an alternative that's been gaining tremendous traction, for example. While it differs even more from the three options we're learning, Svelte still shares many of the foundations of React, Angular, and Vue.

This knowledge transfer doesn't stop at JavaScript or web development, either. The more you learn about any aspect of programming, the more it can be used in other languages or types of programming. Many of the APIs I've used in web development were also valuable when doing engineering work with native languages.

### Will These Tools Stick around? {#tool-longevity}

Honestly? Who's to say. The ecosystem has its fluctuations; many developers definitely seem to feel some level of burnout from, say, the React ecosystem after so long within it.

But here's the thing: these tools are widely backed and used by some of the biggest companies.

These types of tools don't disappear overnight, nor do the jobs associated with these tools.

Take ColdFusion, for example. If you ask most frontend developers, they will likely either not know of ColdFusion or assume it is dead. After all, ColdFusion goes back to 1995 and remains a proprietary paid programming language — yes, those exist — to this day.

But ColdFusion isn't dead! (I can hear my friend Mark holler with excitement and agreement from miles away.) [It's still used by as many websites](https://w3techs.com/technologies/details/pl-coldfusion) [as Angular is](https://w3techs.com/technologies/details/js-angularjs) in 2024 and maintains an ecosystem of a respectable size that's big enough to allow Adobe to sustain the development of the language 27 years later.

Additionally, from a cultural standpoint, many developers are also tired of switching back and forth between new frameworks at seemingly breakneck speeds. Many companies may choose to stay with these tools for longer than anticipated simply because they've grown in expertise with these tools.

Just because a tool is new doesn't mean that it's inherently better; even better-perceived tools may not be selected for various reasons.

# What Are The Prerequisites? {#what-are-the-prerequisites}

We will be learning React, Angular, and Vue from the basics all the way to understanding the inner workings of these frameworks.

**You do not need any prerequisite knowledge of these frameworks and very little pre-requisite knowledge of JavaScript, HTML, or CSS.**

In fact, I will do my best to link out to anything that's expected to be known or valuable in continuing the learning process. That said, if you're new to these topics, some suggested pre-reading might include:

- ["How Computers Speak" — An introduction to how your computer takes "source code" and converts it to machine code.](https://playfulprogramming.com/posts/how-computers-speak)
- ["Introduction to HTML, CSS, and JavaScript" — An explanation of the three fundamentals of web development and how they're utilized to build websites.](https://playfulprogramming.com/posts/intro-to-html-css-and-javascript)
- ["CSS Fundamentals" — An introduction to how CSS works and common rules you should know.](https://playfulprogramming.com/posts/css-fundamentals)
- ["WebDev 101: How to use NPM and Yarn" — An explanation of what "Node" is, what "NPM" is, and how to use them.](https://playfulprogramming.com/posts/how-to-use-npm)
- ["Understanding The DOM: How Browsers Show Content On-Screen" — An explanation of the "DOM" and how it pertains to HTML.](https://playfulprogramming.com/posts/understanding-the-dom)

## What Aren't We Learning? {#what-arent-we-learning}

Before taking a look at some specifics of what we'll be learning, **let's talk about what we won't be spending dedicated time learning in this series**:

- Standalone JavaScript APIs
- CSS
- Linting tooling, such as ESLint or Prettier.
- IDE functionality, such as VSCode, WebStorm, or Sublime Text.
- TypeScript — while Angular code samples will include a bit of it, we won't be diving into the specifics.

All of these are broad topics in their own right and have a plethora of content capable of hosting their own books. After all, resources without a properly defined scope run into challenges of surface-level explanations, jarring transitions, and even delayed publications.

> Remember, knowledge is like a web — these topics intersect in messy and complex ways! It's okay to take your time to learn these or even limit your learning scope to remain focused on a specific subset of knowledge. Nobody knows each and all of these perfectly, and that's okay!

Once again, however, if any of these topics become relevant in the book, we'll link out to resources that will help you explore more and broaden your knowledge base.

## Content Outline {#content-outline}

With the understanding of what we won't be looking at out of the way, **let's talk about what we _will_ be learning about**:

- [What "components" are](/posts/ffg-fundamentals-intro-to-components)
  - Break your app up into more modular pieces
  - The relationship between components and elements and other components and elements
  - Add programmatic logic inside your components
  - What "reactivity" is and how React, Angular, and Vue make it easier to show updated values
  - Binding reactive attributes to your elements
  - Passing values into your components
  - Binding user events to developer-defined behavior
  - Pass values from child components back to their parents
- [Change your UI using dynamic HTML](/posts/ffg-fundamentals-dynamic-html)
  - Conditionally render parts of your app
  - Rendering lists and loops
  - Nuances in "reconciliation" for frameworks like React and Vue
- [Handle user input and output through side effects](/posts/ffg-fundamentals-side-effects)
  - Explaining what a "Side effect" is outside the context of a UI framework
  - Reintroducing the concept in the scope of a framework
  - Trigger side effects during a component render
  - Cleaning up side effects
  - Why we need to clean up side effects (including real-world examples)
  - How do we verify we cleaned up our side effects
  - Handling re-renders
  - Tracking in-component state updates to trigger side effects
  - A framework's lifecycle, including rendering, committing, and painting
  - Changing data without re-rendering
- [Base the state off of another value using derived values](/posts/ffg-fundamentals-derived-values)
  - A naive implementation using prop listening
  - A more thought-through implementation using framework primitives
- [Solve markup problems using transparent elements](/posts/ffg-fundamentals-transparent-elements)
- [Pass children into a component](/posts/ffg-fundamentals-passing-children)
  - Passing one child
  - Passing multiple children
- [Keep a reference to an HTML element in your code](/posts/ffg-fundamentals-element-reference)
  - Track multiple elements at once
  - Real-world usage
- [Reference a component's internals from a parent](/posts/ffg-fundamentals-component-reference)
  - Real-world usage
- [Track errors that occur in your application](/posts/ffg-fundamentals-error-handling)
  - Log errors
  - Ignore errors to allow your user to keep using the app
  - Displaying a fallback when your app is unable to recover from an error
- [Pass complex data throughout your app using dependency injection](/posts/ffg-fundamentals-dependency-injection)
  - Change values after injection
  - Opting out of providing optional values
  - Passing data throughout your entire application
  - Overwriting specific data based on how close you are to the data source
  - Finding the right data to fit your components' needs
  - Learning the importance of consistent data types
- [How to avoid headaches with CSS' `z-index` using portals](/posts/ffg-fundamentals-portals)
  - Understanding why `z-index` has problems in the first place
  - Explaining what a portal is
  - Using component-specific portals
  - Using app-wide portals
  - Using HTML-wide portals
- [Creating composable utilities through shared component logic](/posts/ffg-fundamentals-shared-component-logic)
  - Sharing methods of creating data
  - Sharing side effect handlers
  - Composing custom logic
- [Adding behavior to HTML elements easily using directives](/posts/ffg-fundamentals-directives)
  - Explaining what a directive is
  - Showcasing basic directives
  - How to add side effects to directives
  - Passing data to directives
- [Modifying and accessing a component's children](/posts/ffg-fundamentals-accessing-children)
  - Counting a component's children
  - Modifying each child in a loop
  - Passing values to projected children

> This can seem overwhelming but remember that this book is meant to be a "newcomer" to "expert" resource. You absolutely do not need to tackle this all at once. You can stop at any point, go elsewhere, and come back at your leisure. This book isn't going anywhere and **will be free online forever**; it is [open-source to ensure this is the case](https://github.com/unicorn-utterances/unicorn-utterances/).

But wait, there's more! While this is the outline for the first book in the series, there will be two more books teaching React, Angular, and Vue. The second book will focus on the ecosystem around these tools, and the third will focus specifically on internals and advanced usage.

Throughout this, we will attempt to build a single application as outlined in [the "Introduction to Components" chapter](/posts/ffg-fundamentals-intro-to-components). By the end of this book, you will have a fully functional user interface that you have built yourself through code samples and challenges displayed throughout.

We will also have easy-to-reference resources in case you're already a pro with a specific framework and are looking to quickly learn:

- A glossary of various terms relevant to these frameworks
- A lookup table with equivalent APIs between these frameworks

## A Note on Framework Specifics {#framework-specifics}

As a final note, before I send you into the rest of the book, I want to touch on a few points about these frameworks:

<!-- ::start:tabs -->

### React

Here are a few nuances we should keep in mind about this book's teachings of React:

#### We're Using React Hooks {#react-hooks}

React has two different ways of writing code: Using classes and "Hooks."

While React classes are more similar to Angular or Vue's Option API, **I've decided to write this book using React's "Hooks" method as the reference for our components.**

This is because, while classes are still a part of the most modern versions of React, they've drastically fallen out of favor compared to React Hooks. I want to try to make this book representative of real-world codebases you're likely to run into with modern versions of these frameworks, so I thought it only made sense to go with Hooks.

That all said, the core concepts outlined in this book apply to both of these methods, so if you want to learn the React class API after the fact, it should be easier with this foundation of learning.

### Angular

Here are a few nuances we should keep in mind about this book's teachings of Angular:

#### Angular Is Not AngularJS {#angular-not-angularjs}

Despite the similarities in their names, these two are entirely distinct entities. More specifically, [AngularJS was initially released in 2010](https://playfulprogramming.com/posts/web-components-101-history#2010-The-Early-Days-of-MVC-in-JS) and was followed up by the initial release of Angular in 2016. **Despite this shared lineage, the core concepts shifted drastically between these two releases.** For all intents and purposes, you will not know AngularJS at the end of this book: You will know Angular.

#### We're Using Standalone Components {#standalone-components}

Angular has two ways of defining component imports: modules and standalone components. **We'll be using Standalone components**.

When Angular was first released, it launched with [the concept of NgModules](https://angular.io/guide/ngmodules). Very broadly, this was an API that allowed you to namespace a collection of related UI items (called components, more on that in the next chapter) into so-called "modules".

While these modules worked, they were primarily dissimilar from alternatives in other related frameworks like React and Vue. Further, a common complaint against them is that they were overly complicated with minimal yield.

[Starting with an experimental release in Angular 14](https://github.com/angular/angular/discussions/45554) (and [being marked as stable in Angular 15](https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8)), Angular introduced the "standalone components" API. This was a more similar method of importing similar UI elements into one another and is what our book will be using.

> Keep in mind that if you're working with an older Angular codebase, it's likely to still be using modules.

#### We're Using Self-Closing Tags {#self-closing-tags}

HTML supports self-closing tags on some elements that don't contain children:

```html
<input />
```

Similarly, Angular 15.1 introduced a method for using self-closing tags with component selectors:

```html
<component />
<!-- vs. <component></component> -->
```

**We will be using these self-closing tags throughout the book**, as they're common practice in applications built with the other two frameworks.

> This will not work with versions of Angular older than 15.1, so be aware of this when working in older codebases.

#### We Won't Be Learning "Signals" {#no-signals}

[Early in 2023, the Angular team announced that they would be introducing a new method of programming in Angular called "Signals"](https://angular.io/guide/signals). To pull back the curtains a bit, this book began life in January 2022, and by the time the book had launched, parts of the signals API had not yet been introduced as a stable API within the Angular ecosystem.

While I believe Signals are the way forward for the Angular community, delaying the book further and waiting for this API to stabilize was simply not viable. As such, **this book will not teach Angular signals** at this time.

However, in the future, I will revise this book to be geared towards Angular Signals instead of the current method of Zone.js mutations. This will come as a second edition of the book sometime in the future.

### Vue

Here are a few nuances we should keep in mind about this book's teachings of Vue:

#### We're Using the Composition API {#composition-api}

Vue has two different ways of writing code: The "Options" API and the "Composition" API.

While the "Options" API has been around longer and is more similar to Angular's classes, **this book will use Vue's "Composition API"**. This is for a few reasons:

1. The Composition API is newer and seemingly favored over the Options API for new applications.
2. The Composition API shares some DNA with React's Hooks, making explaining cross-framework concepts easier.
3. The Composition API is relatively trivial to learn once you fully grasp the Options API.
4. Their documentation does a good job of providing code samples in both Options API and Composition API — allowing you to learn both even more easily.
5. [Evan You, the project's creator and lead maintainer, told me to.](https://twitter.com/youyuxi/status/1545281276856262656?s=20&t=ZBooorTRi6dYR1h_VVbu1A) 😝

Similarly, this book will not cover [Vue's other upcoming compiler-based syntax choice, the upcoming `$ref` sugar](https://github.com/vuejs/rfcs/discussions/369). However, the "Internals" book in this book series will walk you through all these different APIs, why they exist, and how they build on top of one another.

#### We're Using SFCs {#vue-sfcs}

Vue is a highly flexible framework and, as a result, allows you to define components with various methods, each with its own set of pros and cons.

**This book will specifically focus on using the ["Single File Component" (or SFC for short) method](https://vuejs.org/guide/scaling-up/sfc.html) of creating Vue components using `.vue` files.**

While the "Internals" book (the third in the series) will introduce the other methods and how they work under the hood, SFCs are commonly used as the de facto method of creating Vue components for most applications.

<!-- ::end:tabs -->

Without further ado, let's get started.
