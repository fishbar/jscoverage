/*!
 * jscoverage: test/jscoverage.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-08 19:32:38
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var jscoverage = require('../lib/jscoverage');
var expect = require('expect.js');
jscoverage.__coveraged__ = false;
jscoverage = require('../lib/jscoverage');

var func = jscoverage._get('jscFunctionBody').toString().split(/\n/);
func.shift();
func.pop();

var wrapperGlobal = eval('(function(){ var global = {}; var $lines$ = [1]; var $conds$ = {"1_1_1": 0}; var $source$=["var a = a ? 1: 0;"];' + func.join('\n') + ' return global;})');

var _global = wrapperGlobal();

describe('lib/jscoverage.js', function(){
  it('jscFunctionBody shoud be ok', function(){
    // mark line
    _global._$jscmd('$file$', 'line', 1);
    // mark cond
    _global._$jscmd('$file$', 'cond', 1, '', 1, 1);
    expect(_global._$jscoverage['$file$'][1]).to.be(1);
    expect(_global._$jscoverage['$file$'].condition['1_1_1']).to.eql(1);
  });
});