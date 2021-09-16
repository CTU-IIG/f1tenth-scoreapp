# f1tenth-scoreapp-frontend

Client-side web app serving as frontend for the [f1tenth-scoreapp](../).

👉 Available online at [f1tenth-scoreapp.netlify.app](https://f1tenth-scoreapp.netlify.app/)

The code is written in **[TypeScript](https://www.typescriptlang.org/)**
and **[React.js](https://reactjs.org/)**. See more in the [Architecture](#architecture) section.

🚧 **Note:** This is work in progress.


## Content

<!-- **Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)* -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Description](#description)
- [Architecture](#architecture)
	- [Technology highlights](#technology-highlights)
	- [Project structure](#project-structure)
- [Development](#development)
	- [Requirements](#requirements)
	- [Set up](#set-up)
	- [Available commands](#available-commands)
- [Deployment](#deployment)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Description

TODO

The UI of the app is fully translated and localized into Czech and English. By default, the app automatically
detects the locale to be used from the browser preferences. In addition, the locale can be changed manually in
the app settings.


## Architecture

_Currently_, it is a client-side-only application (SPA).
**It runs completely in the browser** and it **communicates with the [backend](../backend/) via APIs**
_(REST + WebSocket)_.

The code is written in **[TypeScript](https://www.typescriptlang.org/)**
and **[React.js](https://reactjs.org/)**.

The project has **just three production dependencies** ([React](https://reactjs.org/),
[react-intl](https://formatjs.io/docs/react-intl/)
and [classnames](https://github.com/JedWatson/classnames)). Everything else is implemented from scratch.


### Technology highlights

**Tooling:**
* Webpack – custom configs, custom plugins
* Babel
* ESLint, AVA (tests), GitHub Actions (CI/CD)
* Netlify for [Deployment](#deployment)
* CSS written in Sass (SCSS), vendor prefixes automatically added by autoprefixer with Browserslist

**Features:**
* [Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
  for all scripts and styles included from index.html
* PWA, [web app manifest](./app/manifest.json) including [maskable icons](https://web.dev/maskable-icon/)
* custom **routing** solution for React on top of
  the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
* custom state management for React (with persistence to Local Storage)
* **i18, l10n**
	* [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) (time,
	  numbers, plurals), see for example the [LocalizedDate](./app/components/LocalizedDate.tsx) component
	* advanced ICU messages, see for example [these messages](app/i18n/translations.cs.js#L25)
	* automatic locale detection/negotiation (`navigator.languages`) with support for overwriting the locale
	  on the app-level, see [LocaleLoader](./app/containers/LocaleLoader.tsx) component
* CSS – fully responsive, Flexbox, Grid, animations, transitions, transforms, media queries, ...
* HTML5 semantic elements


### Project structure

The source code is in the [app](./app) directory. Some directories contain feature-specific READMEs. The
following diagram briefly describes the main directories and files:

```text
. (project root dir)
├── .github - GitHub config (GitHub Actions)
├── app - the app source code
│   ├── components - common React components
│   ├── containers
│   │   ├── LocaleLoader - locale loader
│   │   ├── PageRouter - top-level app specific routing component
│   │   └── Root - root component
│   ├── forms-experimental - a custom solution for forms in React (not used)
│   ├── helpers - core functions for different things
│   ├── i18n - translations files
│   ├── images - mainly the PWA app icon
│   ├── router - a custom routing solution
│   ├── store - a custom app state management solution backed by localStorage
│   ├── styles - app styles written in Sass (SCSS)
│   ├── sw - the service worker that handles precaching app shell (not used)
│   ├── views - pages
│   │   ├── CategoryPage.tsx - category contents browsing
│   │   ├── HomePage.tsx - packages listing
│   │   ├── NotFoundPage.tsx - 404
│   │   ├── PackagePage.tsx - package contents browsing
│   │   ├── PracticePage.tsx - questions practice
│   │   └── SettingsPage.tsx - app settings form (locale, sounds, data)
│   ├── _headers - Netlify HTTP headers customization
│   ├── _redirects - Netlify HTTP redirects/rewrites customization
│   ├── index.js - the app starting point
│   ├── manifest.json - a web app manifest for PWA
│   ├── robots.txt
│   ├── routes.ts - app routes definitions
│   ├── template.ejs - index.html template to be built by Webpack 
│   └── types.js - data, state and API types
├── data - JSON app data that simulates API responses
├── test - a few tests
├── tools - custom Webpack plugins
├── types - TypeScript declarations for non-code imports (SVG, MP3)
├── .browserslistrc - Browserslist config
├── .eslintrc.js - ESLint config
├── .nvmrc - Node.js version specification for Netlify
├── ava.config.js - AVA config
├── babel.config.js - Babel config
├── netlify.toml - Netlify main config
├── package.json
├── tsconfig.json - main TypeScript config
├── webpack.config.*.js - Webpack configs
└── yarn.lock
```


## Development


### Requirements

- [Node.js](https://nodejs.org/) 16.x
- [Yarn](https://yarnpkg.com/) 1.x
- You can follow [this Node.js Development Setup guide](../NODEJS-SETUP.md).


### Set up

1. Install all dependencies with Yarn (run `yarn`).
2. You are ready to go.
3. Use `yarn start` to start dev server with HMR.
4. Then open `http://localhost:3000/` in the browser.


### Available commands

* `yarn start` – Starts a development server with hot replacements.

* `yarn build` – Builds the production version and outputs to `dist` folder. Note: Before running an actual
  build, `dist` folder is purged.

* `yarn analyze` – Same as `yarn build` but it also outputs `stats.json`
  and runs [webpack-bundle-analyzer CLI][webpack-bundle-analyzer-cli].

* `yarn tsc` – Runs TypeScript compiler. Outputs type errors to console.

* `yarn lint` – Runs [ESLint](https://eslint.org/). Outputs errors to console.

* `yarn test` – Runs tests using [AVA](https://github.com/avajs/ava).

* `yarn test-hot` – Runs tests using [AVA](https://github.com/avajs/ava) in watch mode.

[webpack-bundle-analyzer-cli]: https://github.com/webpack-contrib/webpack-bundle-analyzer#usage-as-a-cli-utility


## Deployment

_Currently_, We use [Netlify](https://www.netlify.com/) which is practically a CDN on steroids with integrated
builds. There are 3 configuration files that affect the deployment behavior:
* [netlify.toml](./netlify.toml) – global config
* [app/_headers](./app/_headers) – HTTP headers customization (mainly for immutable files)
* [app_redirects](./app/_redirects) – HTTP redirects and rewrites (fallback to index.html for client-side
  routing)
