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

### Issues

#### Modules with absolute paths

Most StealJS modules rely on absolute pathing. Because `destealify` does not
respect `stealconfig.js`, you may need a workaround until it does (or until a
different configuration solution is provided). Since `destealify` looks in
`node_modules/`, the solution is as simple as symlinking your absolute path root
to something in that directory. For example, you can ensure that
`steal("can/route/pushstate.js", function() {...});` works by symlinking your
canjs directory to `node_modules/`, or simply placing the library in that
directory, with the name `can`.

### License

`destealify` is a public domain work, dedicated using
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Feel free to do
whatever you want with it.
