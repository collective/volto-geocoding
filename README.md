# volto-geocoding

A widget for [Volto](https://github.com/plone/volto) to insert values for any language enabled

To be used with mrs-developer, see [Volto docs](https://docs.voltocms.com/customizing/add-ons/) for further usage informations.

## Setup with voltocli

```bash
voltocli
```

and insert `volto-geocoding` as addon name and `git@github.com:collective/volto-geocoding.git` as addon URL.

## Manual setup

In your Volto project:

```bash
yarn add mrs-developer collective/volto-geocoding
```

and in `package.json`:

```json
  "scripts": {
    "develop:npx": "npx -p mrs-developer missdev --config=jsconfig.json --output=addons",
    "develop": "missdev --config=jsconfig.json --output=addons",
    "preinstall": "if [ -f $(pwd)/node_modules/.bin/missdev ]; then yarn develop; else yarn develop:npx; fi",
    "postinstall": "yarn omelette",
    ...
  }
```

Create a `mrs.developer.json` file:

```json
{
  "volto-geocoding": {
    "url": "git@github.com:collective/volto-geocoding.git"
  }
}
```

In `jsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "volto-geocoding": ["addons/volto-geocoding"]
    },
    "baseUrl": "src"
  }
}
```

Fix tests, in `package.json`:

```json
"jest": {
    ...
    "moduleNameMapper": {
      "@plone/volto/(.*)$": "<rootDir>/node_modules/@plone/volto/src/$1",
      "@package/(.*)$": "<rootDir>/src/$1",
      "volto-geocoding/(.*)$": "<rootDir>/src/addons/volto-geocoding/src/$1",
      "~/(.*)$": "<rootDir>/src/$1"
    },
    "testMatch": [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[jt]s?(x)",
      "!**/src/addons/volto/**/*"
    ],
    ...
```

Edit `.eslintrc`:

```json
{
  "extends": "./node_modules/@plone/volto/.eslintrc",
  "settings": {
    "import/resolver": {
      "alias": {
        "map": [
          ["@plone/volto", "@plone/volto/src"],
          ["@package", "./src"],
          ["volto-geocoding", "./src/addons/volto-geocoding/src"]
        ],
        "extensions": [".js", ".jsx", ".json"]
      },
      "babel-plugin-root-import": {
        "rootPathSuffix": "src"
      }
    }
  }
}
```

Add `src/addons` in `.gitignore`:

```
# .gitignore
src/addons
```

Then, run `yarn` and install dependencies:

```bash
yarn
```

## Usage

Once you've installed the addon, you have to configure it.

Due to `react-leaflet` dependency needs, you have to add in the `<head>` its stylesheets, so:

```jsx
// in Html.jsx

       <head>
          ...

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
            integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
            crossOrigin=""
          />
       </head>
```

Then, use the widget for the field you need:

```js
// config.js

import { GeoLocationWidget } from 'volto-geocoding';

export const widgets = {
  ...defaultWidgets,
  id: {
    ...defaultWidgets.id,
    geolocation: GeoLocationWidget,
  },
};
```

### Map

This library exports not only `GeoLocationWidget` but also a component to render a map using OpenStreetMap: `OSMMap`.
You can find it in `src/components/OSMMap/OSMMap.jsx`.

It's a very simple map component accepting a point in coordinates (latitude, longitude) and an address (or description) to be shown within the popup.
