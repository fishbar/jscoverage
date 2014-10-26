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

var _global;

beforeEach(function(){
  _global = wrapperGlobal();
});

describe('lib/jscoverage.js', function(){
  it('jscFunctionBody shoud be ok', function(){
    // mark line
    _global._$jscmd('$file$', 'line', 1);
    // mark cond
    _global._$jscmd('$file$', 'cond', '1_1_1', '');
    expect(_global._$jscoverage['$file$'][1]).to.be(1);
    expect(_global._$jscoverage['$file$'].condition['1_1_1']).to.eql(1);
  });

  it('shoud return "" when content empty', function () {
    var res = jscoverage.process('abc', '');
    expect(res).to.be('');
  });
  it('shoud throw error when filename empty', function () {
    var err;
    try {
      jscoverage.process(null, '');
    } catch (e) {
      err = e;
    }
    expect(err.message).to.match(/filename needed!/);
  });
  it('should carry over existing coverage through inits', function(){
    // Init once
    _global._$jscmd('$file2$', 'init', [1], ['1_1_1'], ['source']);
    // mark line
    _global._$jscmd('$file2$', 'line', 1);

    // Init twice
    _global._$jscmd('$file2$', 'init', [1], [], []);
    // mark line again
    _global._$jscmd('$file2$', 'line', 1);

    expect(_global._$jscoverage['$file2$'][1]).to.be(2);
    expect(_global._$jscoverage['$file2$']['condition'].length).to.be(1);
    expect(_global._$jscoverage['$file2$']['source'].length).to.be(1);
  });
});
