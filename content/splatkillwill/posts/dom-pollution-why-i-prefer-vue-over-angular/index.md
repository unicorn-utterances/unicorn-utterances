---
{
    title: 'Why I prefer Vue over Angular: DOM Pollution',
    description: 'Angular differs from Vue in some keys ways, including its "Incremental rendering". This shift introduces something I call "DOM Pollution"; its why I prefer Vue over Angular.',
    published: '2022-06-06T10:08:00.000Z',
    edited: '2022-06-06T10:08:00.000Z',
    tags: ['webdev', 'angular', 'vue'],
    license: 'cc-by-nc-nd-4'
}
---

One of the reasons I prefer front end frameworks like Vue and React over Angular, is what I like to call DOM Pollution.

Unlike Vue and React, which use a virtual DOM, Angular today uses incremental rendering. Each has its pros and cons, but without a virtual DOM the components need to be represented in the browser's “real” DOM. Kind of like a trail of breadcrumbs, this lets the renderer know how to get back to what it’s updating.

With a renderer like the one used by Angular, breaking down your UI into reusable components comes at a cost; or at least with a side effect to be aware of. Every component adds another tag to the DOM that otherwise wouldn't be there, unless you made one big ugly monolith component. This can cause some problems:

- Complicates CSS selectors
- Makes SEO crawlers jobs harder
- Can make the markup harder to read when debugging
- Can be limiting when trying to wrap an element that needs to be a direct child of another element

To illustrate, take the following example in Vue:

<iframe src="https://codesandbox.io/embed/async-leftpad-gjxmqv?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=dark&highlights=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="A properly formatted table with 'category' and 'amount' headers to your data."
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

Then if you tried the same in Angular:

<iframe src="https://codesandbox.io/embed/cranky-shadow-frukfg?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Fapp%2Fapp.component.html&theme=dark&highlights=2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="A malformed table that shows all data, including headers, horizontally instead of in a grid"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

What happened? Lets compare the custom components.

`MyTextCell.vue`
<iframe src="https://codesandbox.io/embed/async-leftpad-gjxmqv?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FMyTextCell.vue&theme=dark&view=editor"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="MyTextCell.vue"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

`text-cell.component.ts`
<iframe src="https://codesandbox.io/embed/cranky-shadow-frukfg?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Fapp%2Ftext-cell.component.ts&theme=dark&view=editor"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="text-cell.component.ts"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

They both look like they are just wrapping table detail (cell) tags but they render completely diffrent.

Vue output:

```html
<table>
    <!-- ect -->
    <tr>
        <td data-v-5fa58eab="">IT</td><!-- see here -->
        <td data-v-451cbf87="" style="color: red;">5.27</td>
    </tr>
    <!-- ect -->
</table>
```

Angular output:
```html
<my-table _ngcontent-rbt-c270="" _nghost-rbt-c271="">
    <table _ngcontent-rbt-c271="">
        <!-- ect -->
        <my-row _ngcontent-rbt-c270="" _nghost-rbt-c272="">
            <tr _ngcontent-rbt-c272="">
                <!-- ect -->
                <my-text-cell _ngcontent-rbt-c270="" _nghost-rbt-c274=""><!-- see here -->
                    <td _ngcontent-rbt-c274="">IT</td>
                </my-text-cell>
                <!-- ect -->
            </tr>
        </my-row>
        <!-- ect -->
    </table>
</my-table>
```

So much more going on. This is because, even though the components look like they are doing the same thing, the renderer has, and must, output extra tags. Now this isn't how I'd make a table in Angular and there are ways to address this like using `display: table-cell` and `role` attributes on the host but it could still be a hindrance.

This doesn't mean Angular is all that bad. Actually, the reason Angular components are written this way is to closely resemble a proposed standard; Web Components. 

Speaking of that checkout [Corbin](/people/crutchcorn)'s [series on Web Components](/collections/web-components-101) and also [Angular elements](https://angular.io/guide/elements).
