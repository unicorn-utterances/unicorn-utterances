As a community, we welcome anyone to write and submit posts to the Playful Programming blog! In this document, we'll go over how to create a new post in UU and submit it as a pull request.

> [!NOTE]
> For a general tutorial on contributing to a project with GitHub, you may want to go through [the First Contributions guide](https://github.com/firstcontributions/first-contributions) before continuing through this page.

Here are a few things to keep in mind while writing your post:
- Be inclusive! We support all sorts of skill levels - don't disparage newcomers or discourage readers from learning new things.
- Aim to provide factual and relevant information - citing sources is encouraged!
- Keep your content unbiased; i.e. don't advertise commercial products or services without reason.

If at any point you get stuck or want to ask questions, feel free to [open an issue on GitHub](https://github.com/unicorn-utterances/unicorn-utterances/issues/new) or [reach out to us on Discord](https://discord.gg/FMcvc6T) for help!

---

Contents:
1. [Creating an author profile](#creating-an-author-profile)
2. [Writing a new post](#writing-a-new-post)
3. [Translating a Blog Post](#translating-a-blog-post)
4. [Submitting a Pull Request](#submitting-a-pull-request)

# Creating an author profile

Before creating a post, you'll need to add some information about yourself. To do this, create a new folder in [`content/`](./content/) with your username, and add an `index.md` inside it; e.g. `content/eric/index.md`.

Here's an example of what your `index.md` might look like:

```js
---
{
  // "name" should be your displayed name, however you want it
  // to appear on your posts
  name: "Eric Programmer",

  // "firstName" and "lastName" are unfortunately needed for
  // OpenGraph tags - fill these out however you feel is appropriate
  firstName: "Eric",
  lastName: "Programmer",

  // "description" is a short bio that will be shown on your profile page
  description: "Haskell programmer, fanfiction author, and an omniscient unicorn.",

  // Social usernames can include "twitter", "github", "gitlab",
  // "linkedIn", "twitch", "dribbble", "mastodon", "threads", "youtube",
  // and "cohost", as well as a "website" that can be anything you want!
  socials: {
    mastodon: "https://hachyderm.io/@UnicornUtterances",
    github: "unicorn-utterances",
    website: "https://playfulprogramming.com/"
  },

  // "pronouns" are optional, but encouraged to include on your profile
  pronouns: "they/them",

  // "profileImg" should reference an image adjacent to this file
  // - ideally a PNG/JPEG of at least 512px resolution
  profileImg: "./profile.png",

  // "roles" should reflect how you contribute to the site - if you're
  // creating a post, this will just be "author", but there are more
  // roles for developers and translators as well!
  roles: ["author"]
}
---
```

> Don't want to show your real picture on the site? That's alright! We have a [myriad of custom unicorn emotes that can be used as profile pictures as well](https://github.com/unicorn-utterances/design-assets/tree/main/emotes). They're adorable, go check! 🤩

Once your profile is created, you'll be ready to proceed to the next step...

# Writing a new post

All posts on Playful Programming live in a `content/{username}/posts/` folder - we structure this with a subfolder for each post, containing a markdown file named `index.md`. The naming of this post folder will match its URL on the site.

> **New to Markdown?**
>
> Check out the [Markdown Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for examples of how to format different types of content in this file!

When writing your post, you'll need to include some metadata in the frontmatter at the top of the file:

```
---
{
  title: "My First Post",
  description: "This is my first post on the Playful Programming site!",
  published: '2023-04-11',
  tags: ["meta"],
  license: 'cc-by-4'
}
---

Hi! This is my first post! (TODO: write more text here)
```

> **Note**: The "title" that you define here will always be displayed at the top of the post. You don't need to start your post with another heading - otherwise your post will have two titles!

<details>
  <summary><strong>Optional Properties</strong></summary>

  There are a few extra properties that you *can* specify in the post frontmatter, but are not required:

  - `authors: ["author1", "author2"]` can be used to manually specify the author IDs of a post, if written by multiple authors.
  - `edited: "2023-10-21"` can specify the "last updated" date of the post if any edits are made.
  - `collection: "My Awesome Article Series"` will treat a group of posts as a series if they all specify the same `collection` string.
  - `order: 0` will reorder posts in a collection according to whatever value you provide. This has no effect unless the post is in a collection.
  - `originalLink: "https://example.com"` specifies an external URL that the post was originally sourced from. If you're reposting something you've written for another blog, this is important to provide!

</details>

## Licenses

Providing a license helps to explain what readers can do with your work - whether that involves using it for course material, or reusing it in other forms. See [the Creative Commons site](https://creativecommons.org/about/cclicenses/) for an overview of what permissions the various licenses allow.

Currently, the following creative commons licenses are supported as "license" values:

- [`'cc-by-4'`](http://creativecommons.org/licenses/by/4.0/)
- [`'cc-by-nc-sa-4'`](http://creativecommons.org/licenses/by-nc-sa/4.0/)
- [`'cc-by-nc-nd-4'`](https://creativecommons.org/licenses/by-nc-nd/4.0/)
- [`'publicdomain-zero-1'`](https://creativecommons.org/publicdomain/zero/1.0/)

Authors may also choose to omit the "license" property entirely. If you do this, your post will fall under the repository's [MPL 2.0](https://github.com/unicorn-utterances/unicorn-utterances/blob/main/LICENSE.md) license.

## Embedded Links

Blogs can embed their own `<iframe>` tags if necessary - these will initially show a "click to run" preview as to not affect the page's loading time.

A handful of third-party services can also be embedded by simply pasting the link in the post content, including YouTube videos, Twitch clips, Twitter posts - and anything supported by [oembed.com](https://oembed.com).

## Images & Videos

If you have linked images or videos, you'll need to save those files in the same folder and change your markdown file to reference them locally:

```markdown
![Ferris, the adorable crustacean Rust mascot](./ferris.png)
```

> Make sure to add descriptive alt text! Consider what information these images add your post, and what context might be important for readers with visual impairment.

Videos can also be embedded with the following syntax:

```html
<video src="./ios_vs_android.mp4" title="A comparison of how text spacing is applied on iOS and Android"></video>
```

> When possible, `<video>` elements should be preferred over `.gif` files or other animated images in our posts. This is for accessibility concerns - videos provide users with more control over when/how the animation plays.

# Translating a Blog Post

If you are adding a translation, make sure to first create an [Author Data File](#creating-an-author-profile) with the `"translator"` role so that you are credited for your work on the site!

To create a translation file for a post, copy its `index.md` file and rename it to `index.(lang).md`, where `(lang)` is the translated language. For example, a translation for `fr` (French) would be named `index.fr.md`. The content inside this file can then be translated into the respective language.

> If any images used in the post need to be translated, these should be named in a similar fashion - for example, a translation of `dom_tree.svg` should be named `dom_tree.fr.svg`.
>
> Any links to these images will need to be updated in the `index.fr.md` post to point to the translated image.

For reference, the current language codes can be found in [`/content/data/languages.json`](./content/data/languages.json) - you may need to add to this file if the language is missing.

## Finding a Language Code

Each language code in [`/content/data/languages.json`](./content/data/languages.json) should consist of two lowercase letters. If it includes a region, append a hyphen followed by two more lowercase letters. For example, the code for French is `fr` - to specifically refer to the French dialect in Canada, the code would be `fr-ca`.

> Please use `-` instead of `_` in the language region ISO formats. Instead of `fr_ca`, it'd be `fr-ca`.

Refer to [Wikipedia: List of ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for identifiers to be used in this format.

# Submitting a Pull Request

Once all of your changes have been made, [create a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) to merge your post into the site.

- Open a [new Pull Request](https://github.com/unicorn-utterances/unicorn-utterances/compare) from your fork
- Check that your files are in the Pull Request, and that they're being merged into the `main` branch.
- Create the PR and wait for a maintainer to review it.
- Once merged, your post will be visible on the site!

We'll get in touch with any questions or feedback once we've reviewed your post!
