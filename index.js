/*!
 * jscoverage: index.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 *
 */
var fs = require('xfs');
var path = require('path');
var argv = require('optimist').argv;
var patch = require('./lib/patch');
var cmd = argv['$0'];
var MODE_MOCHA = false;
var FLAG_LOCK = false;
if (/mocha/.test(cmd)) {
  MODE_MOCHA = true;
}

if (MODE_MOCHA) {
  prepareMocha();
}
/**
 * prepare env for mocha test
 * @covignore
 */
function prepareMocha() {
  var covIgnore = argv.covignore;
  var cwd = process.cwd();
  var covlevel = argv.coverage;
  if (covlevel) {
    var tmp = covlevel.split(',');
    covlevel = {
      high: parseInt(tmp[0], 10) / 100,
      middle: parseInt(tmp[1], 10) / 100,
      low: parseInt(tmp[2], 10) / 100
    };
  } else {
    covlevel = {
      high: 0.9,
      middle: 0.7,
      low: 0.3
    };
  }
  /**
   * add after hook
   * @return {[type]} [description]
   */
  process.nextTick(function () {
    try {
      after(function () {
        if (FLAG_LOCK) {
          return;
        }
        FLAG_LOCK = true;
        if (typeof _$jscoverage === 'undefined') {
          return;
        }
        try {
          if (argv.covout === 'none') {
            return;
          }
          if (!argv.covout) {
            argv.covout = 'summary';
          }
          var reporter;
          if (/^\w+$/.test(argv.covout)) {
            reporter = require('./reporter/' + argv.covout);
          } else {
            reporter = require(argv.covout);
          }
          reporter.process(_$jscoverage, exports.coverageStats(), covlevel);
        } catch (e) {
          console.error('jscoverage reporter error', e, e.stack);
        }
      });
    } catch (e) {
      // do nothing
    }
  });
  if (argv.covinject) {
    patch.enableInject(true);
  }
  if (!covIgnore) {
    try {
      var stat = fs.statSync('.covignore');
      stat && (covIgnore = '.covignore');
    } catch (e) {
      return;
    }
  }
  try {
    covIgnore = fs.readFileSync(covIgnore).toString().split(/\r?\n/g);
  } catch (e) {
    throw new Error('jscoverage loading covIgnore file error:' + covIgnore);
  }
  var _ignore = [];
  covIgnore.forEach(function (v, i, a) {
    if (!v) {
      return;
    }
    if (v.indexOf('/') === 0) {
      v = '^' + cwd + v;
    }
    _ignore.push(new RegExp(v.replace(/\./g, '\\.').replace(/\*/g, '.*')));
  });

  patch.setCovIgnore(_ignore);
}

var jscoverage = require('./lib/jscoverage');

/**
 * enableInject description
 * @param {Boolean} true or false
 */
exports.enableInject = patch.enableInject;
/**
 * config the inject function names
 * @param  {Object} obj  {get, replace, call, reset}
 * @example
 *
 *  jsc.config({get:'$get', replace:'$replace'});
 *
 *  =====================
 *
 *  testMod = require('testmodule');
 *  testMod.$get('name');
 *  testMod.$replace('name', obj);
 */
exports.config = function (obj) {
  var inject_functions = patch.getInjectFunctions();
  for (var i in obj) {
    inject_functions[i] = obj[i];
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
 * processFile, instrument singfile
 * @sync
 * @param  {Path} source  absolute Path
 * @param  {Path} dest    absolute Path
 * @param  {Object} option  [description]
 */
exports.processFile = function (source, dest, option) {
  var content;
  var stats;
  // test source is file or dir, or not a file
  try {
    stats = fs.statSync(source);
    if (stats.isDirectory()) {
      throw new Error('path is dir');
    } else if (!stats.isFile()) {
      throw new Error('path is not a regular file');
    }
  } catch (e) {
    throw new Error('source file error' + e);
  }

  fs.sync().mkdir(path.dirname(dest));

  content = fs.readFileSync(source).toString();
  content = content.toString();
  content = this.process(source, content);
  fs.writeFileSync(dest, content);
};


/**
 * sum the coverage rate
 * @public
 */
exports.coverageStats = function () {
  var file;
  var tmp;
  var total;
  var touched;
  var n, len;
  var stats = {};
  var conds, condsMap, cond;
  var line, start, offset;
  if (typeof _$jscoverage === 'undefined') {
    return;
  }
  for (var i in _$jscoverage) {
    file = i;
    tmp = _$jscoverage[i];
    if (!tmp.length) {
      continue;
    }
    total = touched = 0;
    for (n = 0, len = tmp.length; n < len; n++) {
      if (tmp[n] !== undefined) {
        total ++;
        if (tmp[n] > 0) {
          touched ++;
        }
      }
    }
    conds = tmp.condition;
    condsMap = {};
    for (n in conds) {
      if (conds[n] === 0) {
        cond = n.split('_');
        line = cond[0];
        start = parseInt(cond[1], 10);
        offset = parseInt(cond[2], 10);
        if (!condsMap[line]) {
          condsMap[line] = [];
        }
        condsMap[line].push([start, offset]);
      } else {
        touched ++;
      }
      total ++;
    }
    stats[file] = {
      sloc: total,
      hits: touched,
      coverage: total ? touched / total : 0,
      percent: total ? ((touched / total) * 100).toFixed(2) + '%' : '~',
      condition: condsMap
    };
  }
  return stats;
};

/**
 * get lcov report
 * @return {[type]} [description]
 */
exports.getLCOV = function () {
  var tmp;
  var total;
  var touched;
  var n, len;
  var lcov = '';
  if (typeof _$jscoverage === 'undefined') {
    return;
  }
  Object.keys(_$jscoverage).forEach(function (file) {
    lcov += 'SF:' + file + '\n';
    tmp = _$jscoverage[file];
    if (!tmp.length) {
      return;
    }
    total = touched = 0;
    for (n = 0, len = tmp.length; n < len; n++) {
      if (tmp[n] !== undefined) {
        lcov += 'DA:' + n + ',' + tmp[n] + '\n';
        total ++;
        if (tmp[n] > 0) {
          touched++;
        }
      }
    }
    lcov += 'end_of_record\n';
  });
  return lcov;
};
