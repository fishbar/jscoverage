var Module = require('module');
var path = require('path');
var Script = process.binding('evals').NodeScript;
var runInThisContext = Script.runInThisContext;
var runInNewContext = Script.runInNewContext;
var argv = require('optimist').argv;
var jscoverage = require('./jscoverage');

var env_nocoverate = argv.nocoverage;
var env_noinject = argv.noinject;

var injectFunctions = {
  get : '_get',
  replace : '_replace',
  test : '_test',
  call : '_call',
  reset : '_reset'
};

exports.enableModuleCache = false;
exports.injectFunctions = injectFunctions;
/**
 * do mock things here
 * @param  {} ){})(
 * @return {}
 */
(function () {
  var _old_require = Module.prototype.require;
  Module.prototype.require = function (filename, flagjsc) {
    var needinject = env_noinject ? false : true;
    var needjsc = !env_nocoverate;
    
    if (!flagjsc) {
      return _old_require.call(this, filename);
    }
    filename = Module._resolveFilename(filename, this);
    if (typeof(filename) === 'object') filename = filename[0];
    if (exports.enableModuleCache) {
      var cachedModule = Module._cache[filename];
      if (cachedModule) {
        return cachedModule.exports;
      }
    }
    var module = new Module(filename, this);
    Module._cache[filename] = module;
    try {
      module.load(filename);
      module.filename = filename;
      module.paths = Module._nodeModulePaths(path.dirname(filename));
      module.loaded = true;
      module.___needjsc = needjsc; // need jscoverage process
      module.___flagjsc = flagjsc;
      module.___needinject = needinject;
      Module._extensions['.js'](module, filename);
    } catch (err) {
      delete Module._cache[filename];
      throw err;
    }
    return module.exports;
  };

  Module.prototype._compile = function (content, filename) {
    var self = this;
    var tmpFuncBody = injectFunctionBody.toString().replace(/\$\$(\w+)\$\$/g, function (m0, m1) {
      return injectFunctions[m1];
    });
    tmpFuncBody = tmpFuncBody.split(/\n/);
    // remove shebang
    content = content.replace(/^\#\!.*/, '');
    if (this.___flagjsc) {
      if (this.___needjsc) {
        content = jscoverage.process(filename,content);
      }
      // always inject
      if (this.___needinject) {
        content += tmpFuncBody.slice(1, tmpFuncBody.length - 1).join('\n');
      }
    }

    function require(path, jscflag) {
      return self.require(path, jscflag);
    }

    require.resolve = function (request) {
      return Module._resolveFilename(request, self);
    };

    Object.defineProperty(require, 'paths', { get: function () {
      var msg = 'require.paths is removed. Use node_modules folders, \
        or the NODE_PATH environment variable instead.';
      throw new Error(msg);
    }});

    require.main = process.mainModule;

    // Enable support to add extra extension types
    require.extensions = Module._extensions;
    require.registerExtension = function () {
      throw new Error('require.registerExtension() removed. \
        Use require.extensions instead.');
    };

    require.cache = Module._cache;

    var dirname = path.dirname(filename);

    if (Module._contextLoad) {
      if (self.id !== '.') {
        debug('load submodule');
        // not root module
        var sandbox = {};
        for (var k in global) {
          sandbox[k] = global[k];
        }
        sandbox.require = require;
        sandbox.exports = self.exports;
        sandbox.__filename = filename;
        sandbox.__dirname = dirname;
        sandbox.module = self;
        sandbox.global = sandbox;
        sandbox.root = root;

        return runInNewContext(content, sandbox, filename, true);
      }

      debug('load root module');
      // root module
      global.require = require;
      global.exports = self.exports;
      global.__filename = filename;
      global.__dirname = dirname;
      global.module = self;

      return runInThisContext(content, filename, true);
    }

    // create wrapper function
    var wrapper = Module.wrap(content);

    var compiledWrapper = runInThisContext(wrapper, filename, true);
    if (global.v8debug) {
      if (!resolvedArgv) {
        resolvedArgv = Module._resolveFilename(process.argv[1], null);
      }

      // Set breakpoint on module start
      if (filename === resolvedArgv) {
        global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
      }
    }

    var args = [ self.exports, require, self, filename, dirname ];
    return compiledWrapper.apply(self.exports, args);
  };
})();

/**
 * do not exec this function
 */
function injectFunctionBody() {
  if (module.exports._i_n_j_e_c_t_e_d_) {
    // DO NOTHING
  } else if (module.exports.$$call$$ || module.exports.$$test$$ || module.exports.$$get$$ ||
      module.exports.$$replace$$ || module.exports.$$reset$$) {
    throw new Error("[jscoverage] jscoverage can not inject function for this module, because the function is exists! using jsc.config({inject:{}})");
  } else {
    var __r_e_p_l_a_c_e__ = {};
    module.exports.$$replace$$ = function (name, obj) {
      function stringify(obj) {
        if (obj === null)
          return 'null';
        if (obj === undefined)
          return 'undefined';
        if (!obj && isNaN(obj))
          return 'NaN';
        if (typeof obj === 'string') {
          return "'" + obj.replace(/"/g, '\\"') + '"';
        }
        if (typeof obj === 'number') {
          return obj;
        }
        if (obj.constructor === Date) {
          return 'new Date(' + obj.getTime() + ')';
        }
        if (obj.constructor === Function) {
          return obj.toString();
        }
        var is_array = obj.constructor === Array ? true : false;
        var res, i;
        if (is_array) {
          res = ['['];
          for (i = 0; i < obj.length; i++) {
            res.push(stringify(obj[i]));
            res.push(',');
          }
          if (res[res.length - 1] === ',')
            res.pop();
          res.push(']');
        } else {
          res = ['{'];
          for (i in obj) {
            res.push(i + ':' + stringify(obj[i]));
            res.push(',');
          }
          res.pop();
          res.push('}');
        }
        return res.join('');
      }
      __r_e_p_l_a_c_e__[name] = eval(name);
      eval(name + "=" + stringify(obj));
    };
    module.exports.$$reset$$ = function (name) {
      eval("if(__r_e_p_l_a_c_e__[\\\"" + name + "\\\"] !== undefined)" + name + " = __r_e_p_l_a_c_e__[\\\"" + name + "\\\"];");
    };
    module.exports.$$call$$ = module.exports.$$test$$ = function (func, args) {
      var f, o;
      if (func.match(/\\./)) {
        func = func.split(".");
        f = func[func.length - 1];
        func.pop();
        o = func.join(".");
      } else {
        f = func;
        o = "this";
      }
      return eval(f + ".apply(" + o + "," + JSON.stringify(args) + ")");
    };
    module.exports.$$get$$ = function (objstr) {
      return eval(objstr);
    };
    module.exports._i_n_j_e_c_t_e_d_ = true;
  }
}