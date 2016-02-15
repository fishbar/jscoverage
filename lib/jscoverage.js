/*!
 * jscoverage: lib/jscoverage.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var Instrument = require('./instrument_2');

/**
 * do not exec this function
 * the function body will insert into instrument files
 *
 * _$jscoverage = {
 *   filename : {
 *     line1: 0
 *     line2: 1
 *     line3: undefined
 *     ....
 *     source: [],
 *     condition: [
 *       line_start_offset
 *     ]
 *   }
 * }
 * @covignore
 */
function jscFunctionBody() {
  /** instrument by jscoverage, do not modifly this file **/
  (function (file, data) {
    var BASE;
    if (typeof global === 'object' && typeof process === 'object') {
      BASE = global;
    } else if (typeof window === 'object') {
      BASE = window;
    } else {
      throw new Error('[ERROR] jscoverage run in unknow env! now only support `node.js` and `browser`');
    }
    if (BASE._$jscoverage) {
      BASE._$jscmd(file, 'init', data);
      return;
    }
    var covs = {};

    function jscmd(file, type, key, expression) {
      var cov = covs[file];
      switch (type) {
        case 'init':
          if (!cov) {
            covs[file] = key;
          }
          break;
        case 'line':
          //console.log(arguments);
          cov.lines[key] ++;
          break;
        case 'branch':
          cov.branches[key] ++;
          break;
        case 'statement':
          cov.statements[key] ++;
          break;
        case 'function':
          cov.functions[key] ++;
          break;
      }
      return expression;
    }

    BASE._$jscoverage = covs;
    BASE._$jscmd = jscmd;
    jscmd(file, 'init', data);
  })('$file$', {
    lines: $lines$,
    branches: $branches$,
    functions: $functions$,
    statements: $statements$,
    source: $source$
  });
}
/**
 * gen coverage head
 */
function genCodeCoverage(instrObj) {
  if (!instrObj) {
    return '';
  }
  var code = [];
  var filename = instrObj.filename;
  // Fix windows path
  filename = filename.replace(/\\/g, '/');
  var jscfArray = jscFunctionBody.toString().split('\n');
  jscfArray = jscfArray.slice(1, jscfArray.length - 1);
  var ff = jscfArray.join('\n').replace(/(^|\n) {2}/g, '\n')
    .replace(/\$(\w+)\$/g, function (m0, m1){
      switch (m1) {
        case 'file':
          return filename;
        case 'lines':
          return JSON.stringify(instrObj.lines);
        case 'branches':
          return JSON.stringify(instrObj.branches);
        case 'functions':
          return JSON.stringify(instrObj.functions);
        case 'statements':
          return JSON.stringify(instrObj.statements);
        case 'source':
          return JSON.stringify(instrObj.source);
      }
    });
  code.push(ff);
  code.push(instrObj.code);
  return code.join('\n');
}

/**
 * for unit test
 */
exports.genCodeCoverage = genCodeCoverage;

exports.process = function (filename, content) {
  if (!filename) {
    throw new Error('jscoverage.process(filename, content), filename needed!');
  }
  filename = filename.replace(/\\/g, '/');
  if (!content) {
    return '';
  }
  var pwd = process.cwd();
  var fname;
  if (filename.indexOf(pwd) === 0) {
    fname = filename.substr(pwd.length + 1);
  } else {
    fname = filename;
  }
  var instrObj;
  var ist = new Instrument();
  instrObj = ist.process(fname, content);
  return genCodeCoverage(instrObj);
};
