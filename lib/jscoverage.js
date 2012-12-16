var instrument = require('./instrument');

/**
 * do not exec this function
 */
function jscFunctionBody() {
  // instrument by jscoverage, do not modifly this file
  if (typeof _$jscoverage === 'undefined') {
    _$jscoverage = {};
    _$jscoverage_done = function (file, line) {
      _$jscoverage[file][line] ++;
    };
    _$jscoverage_init = function (base, file, lines) {
      var tmp = [];
      for (var i = 0; i < lines.length; i ++) {
        tmp[lines[i]] = 0;
      }
      base[file] = tmp;
    };
  }
  if (typeof _$jscoverage_cond === 'undefined') {
    _$jscoverage_cond = {};
    _$jscoverage_cond_done = function (file, line, express) {
      _$jscoverage_cond[file][line] ++;
      return express;
    };
  }
  if (typeof window === 'object') {
    window._$jscoverage = _$jscoverage;
    window._$jscoverage_cond = _$jscoverage_cond;
  } else if (typeof global === 'object') {
    global._$jscoverage = _$jscoverage;
    global._$jscoverage_cond = _$jscoverage_cond;
  }
}
/**
 * gen coverage head
 */
function genCodeCoverage(instrObj) {
  if (!instrObj) return '';
  var code = [];
  var filename = instrObj.file;
  var lines = instrObj.lines;
  var conditions = instrObj.conditions;
  var src = instrObj.src;
  var hh = jscFunctionBody.toString().split(/\n/);
  code.push(hh.slice(1, hh.length - 1).join('\n'));
  code.push('_$jscoverage_init(_$jscoverage, "' + filename + '",' + JSON.stringify(lines)  + ');');
  code.push('_$jscoverage_init(_$jscoverage_cond, "' + filename + '",' + JSON.stringify(conditions)  + ');');
  code.push('_$jscoverage["' + filename + '"].source = ' + JSON.stringify(src) + ';');
  code.push(instrObj.code);
  return code.join('\n');
}

exports.process = function (filename, content) {
  var instrObj;
  if (!filename) {
    throw new Error('jscoverage.process(filename, content), filename needed!');
  }
  if (!content) {
    return '';
  }
  instrObj = instrument(filename, content);
  return genCodeCoverage(instrObj);
};
