---
{
	title: "How to Pick Tech Stacks For New Projects",
	description: 'I often get asked "How do you pick a tech stack for your projects?". The answer is: outline what questions you should be asking early on.',
	published: '2020-03-02T05:12:03.284Z',
	tags: ['opinion'],
	license: 'cc-by-nc-sa-4'
}
---

I talk to engineers; I talk to a lot of engineers. I've spoken to engineers from various backgrounds and various skillsets. We all have had to face the same thing at some point: "What tools do you pick for the job?". It's a question that was phrased perfectly by [Lindsay Campbell](https://www.linkedin.com/in/lindsaycampbelldeveloper/) on [the public Playful Programming Discord server our community use to chat](https://discord.gg/FMcvc6T):

_"When you start a new project, how do you go about planning it? How do you know what features you want? How do you even start do you figure out frameworks, libraries you will use for those different features? What do you do to also make sure that all the different technologies you will be using will work together nicely in your application? Thanks!"_

> Side note, Lindsay is an excellent engineer. You should [check out her profile](https://www.linkedin.com/in/lindsaycampbelldeveloper/) and give her a follow

The answer is ironically a lot less about the solution to a given problem as much as it is discovering the root of the problem itself.

For example, let's look at a project I've been debating on spinning up with a few folks:

An online-first Bootcamp system with interactive quizzes, live-streamed content (like video sessions), a large set of hosted video, and other education-related features.

The first thing I do, _before looking at any tech whatsoever is think about it from a business perspective_.

- "Who is this for?"
- "What do they want?"
- "What's most important to have done first?"
- "What are my stretch goals/holistic vision/defining drive?"
- "What is the profit model?" (if that matters to that project)
- "What's my budget?" (_Budget means more than just finances_, if you're talking about a side project, the budget is the time you have to work on the project).

These are all of the questions I layout before even thinking about coding. I first start by white-boarding these things, explaining them to both myself and my partners, and generally doing my due-diligence concerning project planning.

# Wholistic Vision {#whats-your-vision}

My holistic vision would consist of:

- Simple-to-use UI

- Lots of full-filled content, such as video courses or pictures to serve alongside their written content

- A single place to host a course for someone
- An independent creator feeling comfortable enough to host content here without having to make their landing page in a separate service. As such, we'll need to provide a lightweight customization of a page to showcase their own brand/course.
- Focus on groups rather than single courses. Subscribing to a single content group/creator rather than "React course #1" which has no clear distinction from another "React course #1"

While the first point doesn't inform us of much at this early stage (we'll touch on UI tooling selection later), we can glean from the second point that we'll have to maintain some kind of storage layer. This will be something we'll need to keep in mind as we structure our goals.

# Target Audience {#who-are-you-targetting}

In this case, the groups of people I would want to appeal to are:

- Students looking for a place to learn remotely
- Independent teachers looking for a unified platform to publish through
- Bootcamps looking to have an organized, content-focused site to host their courses

This potentially broad appeal might be able to drive a lot of business, but without a focused plan and a solid profit model, the project would fall flat.

# Profit Model {#layout-your-profit-model}

We'd plan to drive revenue by using the following profit model:

- We'd focus on a B2B type solution where you could pay for a pro account that would make promoting your courses and stuff to other students easier.
- No students would pay for accounts but might pay for a subscription to course content
- We'd likely take a cut of the subscription or charge for course features in some way

# Budget {#define-your-budget}

Finally, none of this can be done without resources. These resources should be budgeted upfront, so what have we got? We have:

- Myself, maybe a few other folks local to my area working on this project
- This project would be a second job or side project for all of us
- Additionally, I'd be working on this project on top of working on other UU content and other side projects

Our limited budget tells us that we will have to be hyper-focused when it comes time to planning out our MVP. We'll need to keep our goals well defined, and if we intend to make it profitable, we'll need to _keep those goals closely aligned with our profit model's requirements define_.

Now that we have a more precise goal of what the problem space we're entering is, we can more clearly define our goals (next part)

# Goals {#mvp}

Now that we're onto setting goals, I like to start thinking about "What is the bare minimum we need to show this to someone to spark a conversation." _This is often called the "minimum viable product" or "MVP" for short_.

Looking at what we need to do from the previous section, I can say that we could probably get away with the following to reach that "MVP":

- User account creation. We'll keep only one type of user for now, but we do need to be aware that users will have different permission roles in the future

- Organizations creation/viewing (we can manually assign users to organizations using the database for now, but we'll want to structure data to support many users per organization)

- This org will need courses, so creation/view of those (no need to manage permissions, that'd be a future feature)

- Courses will need content, so a way to upload/view content on courses

While thinking about these features, I want to keep the implementation details to a minimum, just enough to suffice with our resources by ignoring the nuances of certain permission features. However, notice how, despite thinking about the features minimally, *I'm also mentally mapping how the data should be structured and thinking about long-term implications* in such a way that we can add them later without refactoring everything. This balance during architecture can be tough to achieve and becomes more and more natural with experience.

# Requirements {#data-requirements}

Finally, I look at the data requirements and features and start thinking about what code requirements I'll run into to implement those data requirements.

- I need to upload/download files

  Speaking from experience, doing this with GraphQL is tricky, so I'll stick with REST for the MVP

- My data isn't likely to change structure very much

	As a result, I'd feel comfortable using SQL for something like this.

- I need user authentication

	I don't like rolling my own auth solution, so I'll probably use [passport](https://www.npmjs.com/package/passport) since it's been well tested and stable. If I want to enable users to sign in from their Google accounts or something in the future, I should keep that in mind even if I'm not building that functionality right away

- I am going to be focusing on per-user UI (achievements, dashboards, etc.)

	As such, my use of something like [Gatsby](https://www.gatsbyjs.org/) for static site generation (SSG) isn't realistically beneficial. We could go with server-side rendering (SSR) with something like [Next.JS](https://nextjs.org/), but due to using a lot of media (video/picture), I'd argue there's not much of a return-on-investment (ROI) by building SSR-first since the content has to be loaded by the DOM regardless.

- I'm not likely to have many forms in my application - primarily focusing on viewing rather than form creation

	Sometimes it's important to know what an application is and _isn't_ going to be using. If we were highly focused on forms, I might advocate for [Angular](https://angular.io/) to be used in the front-end (since I have found their form system to be quite robust). However, since I know my team is not as familiar with Angular as other options and we have a limited budget, we likely won't be moving forward with it

- However, we'll be hoping to have a lot of live-streamed user content in the future

	Stuff like "live quizzes," live streaming/playback of video, anything that requires tracking of time/etc is all a great use case for event-based programming. One of the most prominent implementations of this in JavaScript is [RxJS](https://github.com/ReactiveX/rxjs).

So there we have it - a non-Angular, REST API, Passport authenticated, SQL DB, non-SSR, RxJS powered application

Now, this doesn't give us the whole idea, but from here we can start doing further research (next part)

# Extra Pieces

From here, things start becoming a lot more subjective and a lot more social.

While I personally prefer Vue, after talking with my team, it became clear that they're much more comfortable with React. Because React has a large ecosystem with a sturdy backing, I'm not against using it since I feel it can sustain our product's growth over time.

Moving onto CSS was more of the same: It was less "what can support this specific use-case" and more "what is familiar and can sustain our growth?".  

This example is where things get really tricky because you often are not just picking a framework or library, but often a philosophy of CSS as well. After a long-form discussion with my (front-end focused) team about this, we decided to go with Styled Components and Material UI. These tools were decided on due to their flexibility, general A11Y support (for MUI), themability, and our comfort with the tools. The size and stability also took a role in this discussion.

Smaller decisions of libraries for me often boil down to a formula-of-sorts:

- What's their community support like? (can I ask a question and have an answer within a few days)
- What's the size of their community? (typically judged by questions I can find on StackOverflow, their community site/forum or even npm downloads)
- How stable is the tool?
- When was it last updated?
- Does it handle my edge-cases?
- What's the performance of the tool?

Each tool and usage will weigh these questions differently. If I'm looking for a simple timer component library and come across two options, I may be more likely to pick a small library over a larger one, depending on the context. For example, _if that smaller library has clean, easily readable code, but only has seven stars on GitHub, that's likely better for my project than a more bloated alternative because I know I can maintain it if all else fails._ However, I personally wouldn't likely go with something like IO.js (now defunct alternative to Node.js) for a larger project regardless of how clean the code is because I'd be unable to maintain the much more complex tool if I ever needed to.

# Conclusion

To recap, it's a mixture of:
- Proper planning (focusing on features and experience rather than tech)
    - This point should take double priority, as understanding what to start building after picking the tech is important
- Expertise
    I knew that SQL would suffice for our data thanks to my experience scaffolding various applications with SQL and NoSQL alike
- Research
    The only reason I knew that working with binary data over GQL is due to research I did ahead of time before even writing any product code
- Communication
    This one is often overlooked but is **critical** - especially within teams. _Leverage each other's strengths and weaknesses and be open and receptive to suggestions/concerns_

That's by **no** means an easy feat to do, despite reading as if they were. Don't worry if you're not able to execute these skills flawlessly - goodness knows I can't! I'm sure a lot of the decisions I made here, even with the group I spoke to, could have been better guided in different ways. These are the skills that I think I value the most in seniors developer, especially communication. _Communication becomes critical when working with medium/larger teams (or really, groups of any size) since reasonable minds may differ on toolsets that they might see strengths/weaknesses in_.

Have a similar question to the one Lindsey asked? Like conversations like this? Have something to add? [Join us in our Discord server](https://discord.gg/FMcvc6T) to jump into the community and engage in conversations like this! We wouldn't have the quality of our content without our community! 
