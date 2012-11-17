var instrument = require('./instrument');
var parser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;

exports.process = function (filename, content) {
  var instrObj;
  if (!filename) {
    throw new Error('jscoverage.process(filename, content), filename needed!');
    return ;
  }
  if (!content) {
    return '';
  }
  instrObj = instrument(filename,content);
  return genCodeCoverage(instrObj);
}

/**
 * gen coverage head
 */
function genCodeCoverage (instrObj) {
  if(!instrObj) return '';
  var code =[];
  var filename = instrObj.file;
  var lines = instrObj.lines;
  var conditions = instrObj.conditions;
  var src = instrObj.src;
  var hh = __.toString().split(/\n/);
  code.push(hh.slice(1,hh.length-1).join('\n'));
  code.push('_$jscoverage.init("' + filename + '",' + JSON.stringify(lines)  + ');');
  code.push('_$jscoverage_cond.init("' + filename + '",' + JSON.stringify(conditions)  + ');');
  code.push('_$jscoverage["'+filename+'"].source = ' + JSON.stringify(src) + ';');
  code.push(instrObj.code);
  return code.join('\n');
}

function __ () {
// instrument by jscoverage, do not modifly this file 
if (typeof _$jscoverage === 'undefined') {
  _$jscoverage = {
    done : function (file, line) {
      this[file][line] ++;
    },
    init : function (file, lines) {
      if (file === 'init' || file === 'done') {
        throw new Error('jscoverage reserve filenames : init done, please change the file name');
      }
      var tmp = [];
      for (var i = 0; i < lines.length; i ++) {
        tmp[lines[i]] = 0;
      }
      this[file] = tmp;
    }
  };
}
if (typeof _$jscoverage_cond === 'undefined') {
  _$jscoverage_cond = {
    done : _$jscoverage.done,
    init : _$jscoverage.init
  };
}
}
