var through = require("through"),
    infer = require("./node_modules/tern/lib/infer"),
    path = require("path");

module.exports = function(file) {
  var data = "",
      stream = through(write, end);
  return stream;

  function write(buf) { data += buf; }
  function end() {
    stream.queue(isStealModule(data) ? convertStealModule(data) : data);
    stream.queue(null);
  }
};

function convertStealModule(text) {
  var names = [],
      deps = [],
      cb;

  eval(text);
  var source = cb.toString();
  // From http://stackoverflow.com/a/3180012
  var body = source.substring(source.indexOf("{")+1, source.lastIndexOf("}"));

  return generateRequires(names, deps) + body;

  function steal() {
    cb = typeof arguments[arguments.length-1] === "function" &&
      arguments[arguments.length-1];
    [].forEach.call(arguments, function(dep, i, args) {
      if (cb && i < args.length-1) {
        deps.push(dep);
      }
    });
    if (cb) {
        names = getParamNames(cb);
    }
  }
}

function generateRequires(names, deps) {
  var requires = "";
  var dependencies = [];
  var dep;
  for (var i = 0; i < names.length || i < deps.length; i++) {
    if (names[i]) {
      requires += "var "+names[i]+" = ";
    }
    dep = deps[i];
    // Steal does "foo/bar" -> "foo/bar/bar.js", so this might mess with things.
    if (!/\.js$/.test(dep) && dep.indexOf("./") !== 0) {
      dep += "/"+path.basename(dep)+".js";
    }
    requires += dep ?
      "require('"+dep+"');\n" :
      names[i] ?
      "undefined;\n" :
      "";
  }
  return requires;
}

function isStealModule(text) {
  var ctx = new infer.Context([{steal:"fn() -> any()"}]),
      stealFound = false;
  infer.withContext(ctx, function() {
    var ast = infer.parse(text);
    infer.analyze(ast, "steal");
    infer.findRefs(ast, ctx.topScope, "steal", ctx.topScope, function(ref) {
      stealFound = stealFound || !!ref;
    });
  });
  return stealFound;
}

// From http://stackoverflow.com/a/9924463
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
  if (result === null)
     result = [];
  return result;
}
