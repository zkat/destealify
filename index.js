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
  var deps = [],
      cb;

  eval(text);
  var source = cb.toString();
  var requires = generateRequires(deps);
  var body = "module.exports = ("+source+")("+requires.join(",")+");";

  return body;

  function steal() {
    cb = typeof arguments[arguments.length-1] === "function" &&
      arguments[arguments.length-1];
    [].forEach.call(arguments, function(dep, i, args) {
      if (cb && i < args.length-1) {
        deps.push(dep);
      }
    });
  }
}

function generateRequires(deps) {
  var dependencies = [];
  var dep;
  return deps.map(function(dep) {
    // Steal does "foo/bar" -> "foo/bar/bar.js", so this might mess with things.
    if (!/\.js$/.test(dep) && dep.indexOf("./") !== 0) {
      dep += "/"+path.basename(dep)+".js";
    }
    return "require('"+dep+"')";
  });
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
