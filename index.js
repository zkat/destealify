var through = require("through"),
    infer = require("tern/lib/infer"),
    path = require("path");

module.exports = function() {
  return (this.webpack ? webpack : browserify).apply(this, arguments);
};

function applyTransform(file, data) {
  return isStealModule(data) ? convertStealModule(file, data) : data;
}

function webpack(content) {
  this.cacheable && this.cacheable();
  return applyTransform(this.resourcePath, content);
}

function browserify(file) {
  var data = "",
      stream = through(write, end);
  return stream;

  function write(buf) { data += buf; }
  function end() {
    stream.queue(applyTransform(file, data));
    stream.queue(null);
  }
};

function convertStealModule(file, text) {
  var deps = [],
      stealconfig = loadStealConfig(file),
      invocations = [];

  global.window = global.window || global;
  steal.config = function(name) {
    if (name) {
      return stealconfig[name];
    } else {
      return stealconfig;
    }
  };
  steal.isBuilding = true;

  eval(text);
  return invocations.reduce(function(acc, invocation) {
    var source = invocation.callback.toString(),
        requires = generateRequires(invocation.deps, stealconfig);
    return acc+",("+source+")("+requires.join(",")+")";
  }, "module.exports = {}")+";";

  function steal() {
    var cb = (typeof arguments[arguments.length-1] === "function" &&
              arguments[arguments.length-1]);
    invocations.push({
      callback: cb || function(){},
      deps: cb ? [].slice.call(arguments, 0, arguments.length-1) : [].slice.call(arguments)
    });
    return {
      then: function() { return steal.apply(this, arguments); }
    };
  }
}

function generateRequires(deps, config) {
  var dependencies = [];
  var dep;
  return deps.map(function(dep) {
    // Steal does "foo/bar" -> "foo/bar/bar.js", so this might mess with things.
    if (!path.extname(dep) && dep.indexOf("./") !== 0) {
      dep += "/"+path.basename(dep)+".js";
    }
    dep = mapDependency(dep, config.map || {});
    dep = pathDependency(dep, config.paths || {}, config.stealConfigLocation);
    return "require('"+dep+"')";
  });
}

function mapDependency(dep, map) {
  // TODO - support other map options. * is good enough for now, imo
  return (map["*"] && map["*"][dep]) || dep;
}

function pathDependency(dep, paths, configLoc) {
  var depPath = paths[dep];
  return depPath ? path.resolve(configLoc, depPath) : dep;
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

function loadStealConfig(file) {
  var oldSteal = global.steal,
      config,
      curPath = file,
      module;
  global.steal = {
    config: function(obj) {
      config = obj;
    }
  };
  while (!module) {
    curPath = path.dirname(curPath);
    try {
      module = require(curPath+"/stealconfig.js");
    } catch(e) {}
    if (!curPath || curPath === "/") {
      module = module || {config:{}};
    }
  }
  if (!module.config) { module.config = config; }
  global.steal = oldSteal;
  module.config.stealConfigLocation = curPath;
  return module.config;
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
