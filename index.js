/**
 * Jscoverage
 * @author kate.sf@taobao.com, zhengxinlin@gmail.com, fengmk2@gmail.com
 *
 * @usage
 *   # cli command
 *
 *   # using as a node module
 *
 *   # env switch
 *     --nocoverage   close coverage action
 *     --noinject     close inject action
 */
var patch = require('./lib/patch');
var fs = require('fs');
var path = require('path');
var jscoverage = require('./lib/jscoverage');
var Module = require('module');

//global variable. when using mocha, please register it.
_$jscoverage =  undefined;
_$jscoverage_cond = undefined;
/**
 * inject function names
 */
var _inject_functions = path.injectFunctions;
/**
 * enableModuleCache
 *   using module cache or not which has jscoverage flag
 * @param  {Boolean} bool
 */
exports.enableModuleCache = function (bool) {
  patch.enableModuleCache = bool;
};
/**
 * config the inject function names
 * @param  {} obj  {get, replace, test, call, reset}
 * @return {}
 */
exports.config = function (obj) {
  for (var i in obj.inject) {
    _inject_functions[i] = obj.inject[i];
  }
};
/**
 * process Code, inject the coverage code to the input Code string
 * @param {String} filename  jscoverage file flag
 * @param {Code} content
 * @return {Code} instrumented code
 */
exports.process = jscoverage.process;

/**
 * processFile, instrument file or hole dir
 * @sync
 * @param  {Path} source  Path
 * @param  {Path} dest    Path
 * @param  {Array} exclude  exclude files ['test_abc.js', /^_svn/]
 * @param  {Object} option  [description]
 */
exports.processFile = function (source, dest, exclude, option) {
  var content;
  var stats;
  var flag;
  var _exclude = [/^\./];
  var self = this;
  console.log(arguments);
  if (!source || !dest) {
    throw new Error('source path or dest path needed!');
  }
  if (exclude) {
    _exclude = _exclude.concat(exclude);
  }
  // test source is file or dir, or not a file
  try {
    stats = fs.statSync(source);
    if (stats.isFile()) {
      flag = 'file';
    } else if (stats.isDirectory()) {
      flag = 'dir';
    } else {
      throw new Error();
    }
  } catch (e) {
    throw new Error('source is not a file or dir');
  }

  if (flag === 'file') { // process file
    try {
      content = fs.readFileSync(source).toString();
    } catch (e) {
      throw new Error('read source file error! ' + source + e.stack);
    }
    content = content.toString();
    content = this.process(source, content);
    mkdirSync(path.dirname(dest));
    fs.writeFileSync(dest, content);
  } else { // process dir
    var nodes;
    try {
      nodes = fs.readdirSync(source);
    } catch (e) {
      throw new Error('read source dir error! ' + source + e.stack);
    }
    var tmpPath, tmpDest;
    var ignoreLen = _exclude.length;
    nodes.forEach(function (v) {
      // ignore filter
      var m;
      for (var n = 0 ; n < ignoreLen; n++) {
        m = _exclude[n];
        if (typeof m === 'string' && m === v) {
          return;
        } else if (typeof m === 'object' && m.test(v)) {
          return;
        }
      }
      // process file
      tmpPath = path.join(source, v);
      tmpDest = path.join(dest, v);
      self.processFile(tmpPath, tmpDest, exclude, option);
    });
  }
};

/**
 * mock require module, instead of the node require().
 * @param  {Object} mo module object.
 * @return {Function} require : the new require function
 */
exports.mock = function (mo) {
  var _req = Module.prototype.require;
  for (var i in mo.require) {
    _req[i] = mo.require[i];
  }
  return _req;
};
/**
 * jsc.require('module', flagjsc);
 * @param  {Path} file : module path
 * @return {Module} module
 */
exports.require = function (mo, file) {
  return Module.prototype.require.apply(mo, [file, true]);
};

/**
 * Require libs and ignore libs with jscoverage.
 * @param  {Object} mo, current module object.
 * @param  {Array} libs, need to coverage libs.
 * @param  {Array} ignoreLibs, no need to coverage libs.
 */
exports.requireLibs = function (mo, libs, ignoreLibs) {
  var _require = exports.require(mo);
  var items = [];
  var i, l;
  ignoreLibs = ignoreLibs || [];
  for (i = 0, l = ignoreLibs.length; i < l; i++) {
    items.push([ignoreLibs[i], false]);
  }
  libs = libs || [];
  for (i = 0, l = libs.length; i < l; i++) {
    items.push([libs[i], true]);
  }
  for (i = 0, l = items.length; i < l; i++) {
    var item = items[i];
    requirePath(_require, item[0], item[1]);
  }
};

/**
 * sum the coverage rate
 */
exports.coverage = function () {
  var file;
  var tmp;
  var total;
  var touched;
  var n, len;
  for (var i in _$jscoverage) {
    file = i;
    tmp = _$jscoverage[i];
    if (typeof tmp === 'function' || tmp.length === undefined) continue;
    total = touched = 0;
    for (n = 0, len = tmp.length; n < len; n++) {
      if (tmp[n] !== undefined) {
        total ++;
        if (tmp[n] > 0)
          touched ++;
      }
    }
    console.log(
      "[JSCOVERAGE] " +
      file + ":" +
      (total ? (((touched / total) * 100).toFixed(2) + '%') : "Not prepared!!!")
    );
  }
};

exports.coverageDetail = function () {
  var file;
  var tmp;
  var source;
  var lines;
  var allcovered;
  for (var i in _$jscoverage) {
    file = i;
    tmp = _$jscoverage[i];
    if (typeof tmp === 'function' || tmp.length === undefined) continue;
    source = tmp.source;
    allcovered = true;
    //console.log('[JSCOVERAGE]',file);
    console.log('=============== uncovered code =====================');
    lines = [];
    for (var n = 0, len = source.length; n < len ; n++) {
      if (tmp[n] === 0) {
        lines[n] = 1;
        allcovered = false;
      } else {
        lines[n] = '';
      }
    }
    if (allcovered) {
      console.log(colorful("\t100% covered", "GREEN"));
    } else {
      printCoverageDetail(lines, source);
    }
    console.log("=== EOF ===");
  }
};

/**
 * printCoverageDetail
 * @param  {Array} lines [true]
 * @return {}
 */
function printCoverageDetail(lines, source) {
  var len = lines.length;
  lines = lines.join(',');
  //head
  lines = lines.replace(/^([,]+)1/g, function (m0, m1) {
    if (m1.length >= 3) {
      return  m1.substr(3) + '3,2,2,1';
    } else if (m1.length === 2) {
      return '2,2,1';
    } else {
      return '2,1';
    }
  });
  //  1,0,0,0,0,0,1
  lines = lines.replace(/1[,]{3}(,*)[,]{3}1/g, function (m0, m1) {
    return '1,2,2,3,' + m1 + '2,2,1';
  });
  // 1,0,0,0
  lines = lines.replace(/1([,]+)$/g, function (m0, m1) {
    if (m1.length >= 3) {
      return '1,2,2,3' + m1.substr(3);
    } else if (m1.length === 2) {
      return '1,2,2';
    } else {
      return '1,2';
    }
  });
  lines = lines.split(',');
  for (var i = 0; i < len; i++) {
    if (lines[i] !== '') {
      if (lines[i] === '3') {
        console.log('......');
      } else if (lines[i] === '2') {
        echo(i + 1, source[i], false);
      } else {
        echo(i + 1, source[i], true);
      }
    }
  }
  function echo(lineNum, str, bool) {
    console.log(colorful(lineNum, 'LINENUM') + '|' + colorful(str, bool ? 'YELLOW' : 'GREEN'));
  }
}
/**
 * colorful display
 * @param  {} str
 * @param  {} type
 * @return {}
 */
function colorful(str, type) {
  var head = '\x1B[', foot = '\x1B[0m';
  var color = {
    "LINENUM" : 36,
    "GREEN"  : 32,
    "YELLOW"  : 33,
    "RED" : 31
  };
  return head + color[type] + 'm' + str + foot;
}

/**
 * require the file in the path
 * @param  {Function} require : the require function
 * @param  {Path} p : path to be requre
 * @param  {Boolean} flagjsc : flagjsc
 */
function requirePath(require, p, cov) {
  var stat = fs.statSync(p);
  if (stat.isFile()) {
    // only require .js file.
    if (path.extname(p) === '.js') {
      require(p, cov);
    }
  } else if (stat.isDirectory()) {
    var names = fs.readdirSync(p);
    for (var i = 0, l = names.length; i < l; i++) {
      var name = names[i];
      if (name[0] === '.') {
        continue;
      }
      requirePath(require, path.join(p, name), cov);
    }
  }
}

function mkdirSync(filepath, mode) {
  mode = mode ? mode : 0644;
  var paths = [];
  var exist = _checkDirExistSync(filepath);
  while (!exist) {
    paths.push(filepath);
    filepath = path.dirname(filepath);
    exist = _checkDirExistSync(filepath);
  }
  for (var n = paths.length - 1; n >= 0 ; n--) {
    fs.mkdirSync(paths[n]);
  }
  return true;
}
function _checkDirExistSync(filepath) {
  var exist = fs.existsSync(filepath);
  var stat;
  if (exist) {
    stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      return true;
    } else {
      throw new Error(filepath + ' Not a directory');
    }
  }
  return false;
}