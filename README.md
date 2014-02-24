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

### License

`destealify` is a public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.
