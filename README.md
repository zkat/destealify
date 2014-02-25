# destealify

[destealify](https://github.com/zkat/destealify) is a
[browserify](http://browserify.org/) transform that allows free intermixing of
[StealJS](https://github.com/bitovi/steal) modules with
[Node.js](http://nodejs.org/)-style CommonJS modules.

# Quickstart

### Install

    $ npm install destealify

### Examples

#### Command Line

```
browserify -t destealify main.js -o bundle.js
```

#### API

```javascript
var browserify = require('browserify');
var fs = require('fs');

var b = browserify('main.js');
b.transform('destealify');

b.bundle().pipe(fs.createWriteStream('bundle.js'));
```

#### package.json

For packages that are written as StealJS modules, add a browserify
transform field to `package.json` and browserify will apply the transform
to all modules in the package as it builds a bundle.

```
{
  "name": "anchor",
  "main": "main",
  "browserify": {
    "transform": "destealify"
  }
}
```

### stealconfig.js

Most StealJS modules rely on absolute pathing. There are two ways around this:

0. use symlinks in `node_modules/` to arrange your paths such that `require()`
works as expected for the paths in the steal module.
0. Use a `stealconfig.js` file in a parent directory of your module and use the
`map` and `paths` options, which are handled by this transform, to map module
names as needed.

For example, if you have a module that looks like:

```js
steal("frob/this", function() {
});
```

`destealify` will first translate that dependency to `"frob/this/this.js"`,
following StealJS conventions.

If your `this.js` library is located in
`./bower_components/frobjs/this/index.js`, you can write a stealconfig.js in
your project's root that looks like:

```js
steal.config({
  map: {
    "*": {
      "frob/this/this.js": "thisjs"
    }
  },
  paths: {
    "thisjs": "bower_components/frobjs/this"
  }
});
```

and everything will be taken care of for you.

### License

`destealify` is a public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.
