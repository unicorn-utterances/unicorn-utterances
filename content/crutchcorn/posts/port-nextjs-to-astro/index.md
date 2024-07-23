---
{
	title: 'Porting a Next.js Site to Astro Step-by-Step',
	description: "Let's port a site from Next.js to Astro, expanding on the official migration guide.",
	published: '2023-06-29T22:12:03.284Z',
	tags: ['nextjs', 'react', 'astro'],
	license: 'cc-by-nc-sa-4'
}
---

[Astro is a WebDev meta-framework](https://astro.build) that allows you to build highly performant websites, that, out-of-the-box compile down to 0kb of JavaScript in your bundle.

 If your site is a marketing site, or if performance is a substantial concern for your app, it may make sense to migrate from Next.js to Astro - as we [at Playful Programming](/) once did.

While Astro provides a good guide of [how to migrate from Next.js to Astro](https://docs.astro.build/en/guides/migrate-to-astro/from-nextjs/) (written by yours truly!), I felt it would be helpful to see an expanded step-by-step guide on how to migrate a [Pokédex](https://www.pokemon.com/us/pokedex) application from Next.js to Astro.

![A list of the original 150 pokemon with a picture of each](./homepage.png)

> For the full codebase of the Pokédex application, [check the original repo here](https://github.com/crutchcorn/nextjs-pokemon-small-app).



Let's start the migration by changing our layout file to an Astro layout file.

## Next base layout to Astro

To start migrating a Next.js layout file from Next.js to Astro, you'll:

1. Identify the return().

    ```jsx {6-18}
    // _document.js
    import { Html, Head, Main, NextScript } from 'next/document'

    export default function Document() {
        return (
            <Html>
                <Head lang="en">
                    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                </Head>
                <body>
                    <div className="screen">
                        <div className='screen-contents'>
                            <Main />
                        </div>
                    </div>
                    <NextScript />
                </body>
            </Html>
        )
    }
    ```

2. Create `Layout.astro` and add this `return` value, [converted to Astro syntax](#reference-convert-nextjs-syntax-to-astro). 

    Note that:

    - `<Html>` becomes `<html>`
    - `<Head>` becomes `<head>`
    - `<Main />` becomes `<slot />` 
    - `className` becomes `class` 
    - We do not need `<NextScript>`

    ```astro
    ---
    // src/layouts/Layout.astro
    ---
    <html>
        <head lang="en">
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </head>
        <body>
            <div class="screen">
                <div class='screen-contents'>
                    <slot />
                </div>
            </div>
        </body>
    </html>
    ```

3. Import the CSS (found in `_app.js`)

    In addition to the `_document` file, the Next.js application has a `_app.js` file that imports global styling via a CSS import:

    ```jsx {3}
    // pages/_app.js
    import '../styles/index.css'
    
    export default function MyApp({ Component, pageProps }) {
      return <Component {...pageProps} />
    }
    ```

    This CSS import can be moved to the Astro Layout component:

    ```astro {1-5}
    ---
    // src/layouts/Layout.astro
    import '../styles/index.css'
    ---
    
    <html>
        <head lang="en">
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </head>
        <body>
            <div class="screen">
                <div class='screen-contents'>
                    <slot />
                </div>
            </div>
        </body>
    </html>
    ```

## Convert a Next.js `getStaticProps` Page to Astro

Next up, let's migrate [Next.js' `getStaticProps` method](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-static-props) to use Astro's data fetching.

We'll start with a Next.js page that lists the first 151 Pokémon using [the REST PokéAPI](https://pokeapi.co/):

```jsx
// pages/index.js
import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/poke-list.module.css';

export default function Home({ pokemons }) {
    return (
        <>
            <Head>
                <title>Pokedex: Generation 1</title>
            </Head>
            <ul className={`plain-list ${styles.pokeList}`}>
                {pokemons.map((pokemon) => (
                    <li className={styles.pokemonListItem} key={pokemon.name}>
                        <Link className={styles.pokemonContainer} as={`/pokemon/${pokemon.name}`} href="/pokemon/[name]">
                            <p className={styles.pokemonId}>No. {pokemon.id}</p>
                            <img className={styles.pokemonImage} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={`${pokemon.name} picture`}></img>
                            <h2 className={styles.pokemonName}>{pokemon.name}</h2>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

export const getStaticProps = async () => {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    const resJson = await res.json();
    const pokemons = resJson.results.map(pokemon => {
        const name = pokemon.name;
        // https://pokeapi.co/api/v2/pokemon/1/
        const url = pokemon.url;
        const id = url.split("/")[url.split("/").length - 2];
        return {
            name,
            url,
            id
        }
    });
    return {
        props: {
            pokemons,
        },
    }
}
```

### Move Next Page Templating to Astro

To start migrating this page to Astro, start with the returned JSX and place it within an `.astro` file:

```astro
---
// src/pages/index.astro
import styles from '../styles/poke-list.module.css';
---

<head>
    <title>Pokedex: Generation 1</title>
</head>
<ul class={`plain-list ${styles.pokeList}`}>
    {pokemons.map((pokemon) => (
        <li class={styles.pokemonListItem} key={pokemon.name}>
            <a class={styles.pokemonContainer} href={`/pokemon/${pokemon.name}`}>
                <p class={styles.pokemonId}>No. {pokemon.id}</p>
                <img class={styles.pokemonImage} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={`${pokemon.name} picture`}></img>
                <h2 class={styles.pokemonName}>{pokemon.name}</h2>
            </Link>
        </li>
    ))}
</ul>
```

During the migration to Astro templating, this example also:

- Imported styles move to the code fence
- Removed the `<>` container fragment, as it is not needed in Astro's template.
- Changed `className` to a more standard `class` attribute.
- Migrated the Next `<Link>` component to an `<a>` HTML element.

Now move the `<head>` into your existing `layout.astro` file. To do this, we can:

1. Pass the `title` property to the `layout.astro` file via `Astro.props`
2. Import the layout file in `/src/pages/index.astro`
3. Wrap the Astro page's template in the Layout component

```astro {5,11}
---
// src/layouts/Layout.astro
import '../styles/index.css'

const {title} = Astro.props;
---

<html>
    <head lang="en">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>{title}</title>
    </head>
    <body>
        <div class="screen">
            <div class='screen-contents'>
                <slot />
            </div>
        </div>
    </body>
</html>
```

```astro {4,7,19}
---
// src/pages/index.astro
import styles from '../styles/poke-list.module.css';
import Layout from '../layouts/layout.astro';
---

<Layout title="Pokedex: Generation 1">
    <ul class={`plain-list ${styles.pokeList}`}>
        {pokemons.map((pokemon) => (
            <li class={styles.pokemonListItem} key={pokemon.name}>
                <a class={styles.pokemonContainer} href={`/pokemon/${pokemon.name}`}>
                    <p class={styles.pokemonId}>No. {pokemon.id}</p>
                    <img class={styles.pokemonImage} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={`${pokemon.name} picture`}></img>
                    <h2 class={styles.pokemonName}>{pokemon.name}</h2>
                </Link>
            </li>
        ))}
    </ul>
</Layout>
```

### Move Next Page Logic Requests to Astro

This is the `getStaticProps` method from the Next.js page:

```jsx
export const getStaticProps = async () => {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    const resJson = await res.json();
    const pokemons = resJson.results.map(pokemon => {
        const name = pokemon.name;
        // https://pokeapi.co/api/v2/pokemon/1/
        const url = pokemon.url;
        const id = url.split("/")[url.split("/").length - 2];
        return {
            name,
            url,
            id
        }
    });
    return {
        props: {
            pokemons,
        },
    }
}
```

This then passes the `props` into the `Home` component that's been defined:

```jsx
export default function Home({ pokemons }) {
	// ...
}
```

In Astro, this process is different. Instead of using a dedicated `getStaticProps` function, move the props logic into the code fence of our Astro page:

```astro {5-17}
---
// src/pages/index.astro
import styles from '../styles/poke-list.module.css';
import Layout from '../layouts/layout.astro';
const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
const resJson = await res.json();
const pokemons = resJson.results.map(pokemon => {
    const name = pokemon.name;
    // https://pokeapi.co/api/v2/pokemon/1/
    const url = pokemon.url;
    const id = url.split("/")[url.split("/").length - 2];
    return {
        name,
        url,
        id
    }
});
---

<Layout title="Pokedex: Generation 1">
    <ul class={`plain-list ${styles.pokeList}`}>
        {pokemons.map((pokemon) => (
            <li class={styles.pokemonListItem} key={pokemon.name}>
                <a class={styles.pokemonContainer} href={`/pokemon/${pokemon.name}`}>
                    <p class={styles.pokemonId}>No. {pokemon.id}</p>
                    <img class={styles.pokemonImage} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={`${pokemon.name} picture`}></img>
                    <h2 class={styles.pokemonName}>{pokemon.name}</h2>
                </Link>
            </li>
        ))}
    </ul>
</Layout>
```

You should now have a fully working Pokédex entries screen.

## Convert a Next.js `getStaticPaths` Page to Astro

This is a Next.js dynamic page that generates a detail screen for each of the first 151 Pokémon using [the REST PokéAPI](https://pokeapi.co/).

```jsx
// pages/pokemon/[name].js
import { useRouter } from 'next/router';
import Head from 'next/head'
import styles from '../../styles/pokemon-entry.module.css';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Pokemon({ pokemon }) {
  const router = useRouter();
  const title = `Pokedex: ${pokemon.name}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <button onClick={() => router.back()} className={styles.backBtn} aria-label="Go back"></button>
      <img className={styles.pokeImage} src={pokemon.image} alt={`${pokemon.name} picture`} />
      <div className={styles.infoContainer}>
        <h1 className={styles.header}>No. {pokemon.id}: {pokemon.name}</h1>
        <table className={styles.pokeInfo}>
          <tbody>
            <tr>
              <th>Types</th>
              <td>{pokemon.types}</td>
            </tr>
            <tr>
              <th>Height</th>
              <td>{pokemon.height}</td>
            </tr>
            <tr>
              <th>Weight</th>
              <td>{pokemon.weight}</td>
            </tr>
          </tbody>
        </table>
        <p className={styles.flavor}>{pokemon.flavorText}</p>
      </div>
    </>
  )
}

export const getStaticPaths = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
  const resJson = await res.json();
  const pokemons = resJson.results;

  return {
    paths: pokemons.map(({ name }) => ({
      params: { name },
    }))
  }
}

export const getStaticProps = async (context) => {
  const { name } = context.params
  const [pokemon, species] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`).then(res => res.json())
  ])

  return {
    props: {
      pokemon: {
        id: pokemon.id,
        image: pokemon.sprites.front_default,
        name: capitalize(pokemon.name),
        height: pokemon.height,
        weight: pokemon.weight,
        flavorText: species.flavor_text_entries[0].flavor_text,
        types: pokemon.types.map(({ type }) => type.name).join(', ')
      },
    },
  }
}
```

### Move Next Page Templating to Astro

To start migrating this page to Astro, start with the returned JSX and place it within an `.astro` file:

```astro
---
// src/pages/pokemon/[name].astro
import styles from '../../styles/pokemon-entry.module.css';
---

<Layout title={`Pokedex: ${pokemon.name}`}>
  <button onclick="history.go(-1)" class={styles.backBtn} aria-label="Go back"></button>
  <img class={styles.pokeImage} src={pokemon.image} alt={`${pokemon.name} picture`} />
  <div class={styles.infoContainer}>
    <h1 class={styles.header}>No. {pokemon.id}: {pokemon.name}</h1>
    <table class={styles.pokeInfo}>
      <tbody>
        <tr>
          <th>Types</th>
          <td>{pokemon.types}</td>
        </tr>
        <tr>
          <th>Height</th>
          <td>{pokemon.height}</td>
        </tr>
        <tr>
          <th>Weight</th>
          <td>{pokemon.weight}</td>
        </tr>
      </tbody>
    </table>
    <p class={styles.flavor}>{pokemon.flavorText}</p>
  </div>
</Layout>
```

Like before:

- Imported styles are moved to the code fence.
- `className` becomes `class`.
- `<Head>` contents are moved into `<Layout>`.
- `{pokemon.id}` values are interpolated the same as before.

However, in addition, now:

- [HTML's standard `onclick`](https://developer.mozilla.org/en-US/docs/Web/Events/Event_handlers#using_onevent_properties) function is used to call [the browser's `history.go` function](https://developer.mozilla.org/en-US/docs/Web/API/History/go) to navigate back.

### Move Next `getStaticPaths` to Astro

Astro supports a function called `getStaticPaths` to generate dynamic paths, similar to Next.

Given a Next page:

```jsx
// pages/pokemon/[name].js
export const getStaticPaths = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
  const resJson = await res.json();
  const pokemons = resJson.results;

  return {
    paths: pokemons.map(({ name }) => ({
      params: { name },
    }))
  }
}
```

Migrate the `getStaticPaths` method to Astro by removing the `paths` route prefix and returning an array:

```astro {10-12}
---
// src/pages/pokemon/[name].astro
import styles from '../../styles/pokemon-entry.module.css';

export const getStaticPaths = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
  const resJson = await res.json();
  const pokemons = resJson.results;

  return pokemons.map(({ name }) => ({
      params: { name },
    }))
}
---

<Layout title={`Pokedex: ${pokemon.name}`}>
  <button onclick="history.go(-1)" class={styles.backBtn} aria-label="Go back"></button>
  <img class={styles.pokeImage} src={pokemon.image} alt={`${pokemon.name} picture`} />
  <div class={styles.infoContainer}>
    <h1 class={styles.header}>No. {pokemon.id}: {pokemon.name}</h1>
    <table class={styles.pokeInfo}>
      <tbody>
        <tr>
          <th>Types</th>
          <td>{pokemon.types}</td>
        </tr>
        <tr>
          <th>Height</th>
          <td>{pokemon.height}</td>
        </tr>
        <tr>
          <th>Weight</th>
          <td>{pokemon.weight}</td>
        </tr>
      </tbody>
    </table>
    <p class={styles.flavor}>{pokemon.flavorText}</p>
  </div>
</Layout>
```

Then, similar to the previous page, migrate the `getStaticProps` method to non-function-wrapped code in the Astro page's code fence.

Given the Next page logic:
```jsx
// pages/pokemon/[name].js
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getStaticProps = async (context) => {
  const { name } = context.params
  const [pokemon, species] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`).then(res => res.json())
  ])

  return {
    props: {
      pokemon: {
        id: pokemon.id,
        image: pokemon.sprites.front_default,
        name: capitalize(pokemon.name),
        height: pokemon.height,
        weight: pokemon.weight,
        flavorText: species.flavor_text_entries[0].flavor_text,
        types: pokemon.types.map(({ type }) => type.name).join(', ')
      },
    },
  }
}
```

Migrate this to the Astro page's code fence:

> Use `Astro.props` to access the `params` returned from the `getStaticPaths` function

```astro {15-33}
---
// src/pages/pokemon/[name].astro
import styles from '../../styles/pokemon-entry.module.css';

export const getStaticPaths = async () => {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
  const resJson = await res.json();
  const pokemons = resJson.results;

  return pokemons.map(({ name }) => ({
      params: { name },
    }))
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const { name } = Astro.props;
const [pokemonData, species] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`).then(res => res.json())
])

const pokemon = {
    id: pokemonData.id,
    image: pokemonData.sprites.front_default,
    name: capitalize(pokemonData.name),
    height: pokemonData.height,
    weight: pokemonData.weight,
    flavorText: species.flavor_text_entries[0].flavor_text,
    types: pokemonData.types.map(({ type }) => type.name).join(', ')
};
---

<Layout title={`Pokedex: ${pokemon.name}`}>
  <button onclick="history.go(-1)" class={styles.backBtn} aria-label="Go back"></button>
  <img class={styles.pokeImage} src={pokemon.image} alt={`${pokemon.name} picture`} />
  <div class={styles.infoContainer}>
    <h1 class={styles.header}>No. {pokemon.id}: {pokemon.name}</h1>
    <table class={styles.pokeInfo}>
      <tbody>
        <tr>
          <th>Types</th>
          <td>{pokemon.types}</td>
        </tr>
        <tr>
          <th>Height</th>
          <td>{pokemon.height}</td>
        </tr>
        <tr>
          <th>Weight</th>
          <td>{pokemon.weight}</td>
        </tr>
      </tbody>
    </table>
    <p class={styles.flavor}>{pokemon.flavorText}</p>
  </div>
</Layout>
```

You have now fully migrated a Pokédex application from Next to Astro.

