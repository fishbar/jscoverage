/*!
 * jscoverage: lib/patch.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var Module = require('module');
var path = require('path');
var fs = require('fs');
var argv = require('optimist').argv;
var jscoverage = require('./jscoverage');
var escapeRe = require('escape-string-regexp');
var covInject = false;

var defaultCovIgnore = [
  new RegExp('^' + escapeRe(path.join(process.cwd(),"node_modules/"))),
  new RegExp('^' + escapeRe(path.join(process.cwd(),"test/")))
];
var covIgnore = defaultCovIgnore;

var injectFunctions = {
  get : '_get',
  replace : '_replace',
  call : '_call',
  reset : '_reset',
  test: '_test'
};

exports.getInjectFunctions = function () {
  return injectFunctions;
};

exports.enableInject = function (bool) {
  covInject = bool;
};
exports.setCovIgnore = function (ignore, bool) {
  if (bool) {
    covIgnore = ignore;
  } else {
    covIgnore = ignore.concat(defaultCovIgnore);
  }
};
/**
 * do mock things here
 * @covignore
 */
(function () {
  if (Module.prototype.__jsc_patch__) {
    return;
  }
  Module.prototype.__jsc_patch__ = true;
  var origin_require = Module.prototype.require;
  var processExts = ['.js', '.coffee', '.litcoffee'];
  Module.prototype.require = function (filename) {
    var needinject = covInject;
    var ff = filename;
    filename = Module._resolveFilename(filename, this);
    var ext = path.extname(filename);
    var flagjsc = checkModule(filename);
    if (typeof filename  === 'object') {
      filename = filename[0];
    }
    if (!flagjsc || processExts.indexOf(ext) === -1) {
      return origin_require.call(this, filename);
    }

    var cachedModule = Module._cache[filename];
    // take care of module cache
    if (flagjsc && cachedModule && cachedModule.__coveraged__) {
      return cachedModule.exports;
    }
    
    var module = new Module(filename, this);
    try {
      module.filename = filename;
      module.paths = Module._nodeModulePaths(path.dirname(filename));
      Module._extensions[ext](module, filename, {
        flagjsc : flagjsc,
        needinject : needinject
      });
      module.__coveraged__ = flagjsc;
      module.loaded = true;
      Module._cache[filename] = module;
    } catch (err) {
      delete Module._cache[filename];
      console.error(filename, err.stack);
      throw err;
    }
    return module.exports;
  };
  function stripBOM(content) {
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
    // because the buffer-to-string conversion in `fs.readFileSync()`
    // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }
  Module._extensions['.js'] = function (module, filename, status) {
    var content = fs.readFileSync(filename, 'utf8');
    var tmpFuncBody;
    var injectFn = exports.getInjectFunctions();
    // trim first line when script is a shell script
    // content = content.replace(/^\#\![^\n]+\n/, '');
    if (status && status.flagjsc) {
      content = jscoverage.process(filename, content);
    }
    if (status && status.needinject) {
      tmpFuncBody = injectFunctionBody.toString().replace(/\$\$(\w+)\$\$/g, function (m0, m1) {
        return injectFunctions[m1];
      });
      tmpFuncBody = tmpFuncBody.split(/\n/);
      content += '\n' + tmpFuncBody.slice(1, tmpFuncBody.length - 1).join('\n');
    }
    module._compile(stripBOM(content), filename);
  };
  if (Module._extensions['.coffee']) {
    Module._extensions['.coffee'] = Module._extensions['.litcoffee'] = function (module, filename, status) {
      var CoffeeScript = require('coffee-script');
      var content = CoffeeScript._compileFile(filename, false);
      var tmpFuncBody;
      var injectFn = exports.getInjectFunctions();
      // trim first line when script is a shell script
      // content = content.replace(/^\#\![^\n]+\n/, '');
      if (status && status.flagjsc) {
        content = jscoverage.process(filename, content);
      }
      if (status && status.needinject) {
        tmpFuncBody = injectFunctionBody.toString().replace(/\$\$(\w+)\$\$/g, function (m0, m1) {
          return injectFunctions[m1];
        });
        tmpFuncBody = tmpFuncBody.split(/\n/);
        content += '\n' + tmpFuncBody.slice(1, tmpFuncBody.length - 1).join('\n');
      }
      module._compile(stripBOM(content), filename);
    };
  }
})();

function checkModule(module) {
  // native module does not contain / (or \ on windows)
  if (!/[\/\\]/.test(module)) {
    return false;
  }

  // modules in node_modules
  var flagIgnore = false;
  covIgnore.forEach(function (v) {
   
    if (v.test(module)) {
      flagIgnore = true;
    }
    
  });
  return !flagIgnore;
}

/**
 * do not exec this function
 * @covignore
 */
function injectFunctionBody() {
  (function (){
  if (module.exports._i_n_j_e_c_t_e_d_) {
    return;
  }
  if (module.exports.$$call$$ || module.exports.$$get$$ ||
      module.exports.$$replace$$ || module.exports.$$reset$$) {
    throw new Error("[jscoverage] jscoverage can not inject function for this module, because the function is exists! using jsc.config({inject:{}})");
  }

  var __r_e_p_l_a_c_e__ = {};
  module.exports.$$replace$$ = function (name, obj) {
    function stringify(obj) {
      if (obj === null) {
        return 'null';
      }
      if (obj === undefined){
        return 'undefined';
      }
      if (!obj && isNaN(obj)){
        return 'NaN';
      }
      if (typeof obj === 'string') {
        return '"' + obj.replace(/"/g, '\\"') + '"';
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
      if (obj.constructor === RegExp) {
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
        if (res[res.length - 1] === ',') {
          res.pop();
        }
        res.push(']');
      } else {
        res = ['{'];
        for (i in obj) {
          res.push(i + ':' + stringify(obj[i]));
          res.push(',');
        }
        if (res[res.length - 1] === ',')
          res.pop();
        res.push('}');
      }
      return res.join('');
    }
    if (!__r_e_p_l_a_c_e__.hasOwnProperty(name)) {
        __r_e_p_l_a_c_e__[name] = eval(name);
      }
    eval(name + "=" + stringify(obj));
  };
  module.exports.$$reset$$ = function (name) {
    var script;
    if (name) {
      script = 'if(__r_e_p_l_a_c_e__.hasOwnProperty("' + name + '"))' + name + ' = __r_e_p_l_a_c_e__["' + name + '"];';
    } else {
      script = 'for(var i in __r_e_p_l_a_c_e__){eval( i + " = __r_e_p_l_a_c_e__[\'" + i + "\'];");}';
    }
    eval(script);
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
})();
}
