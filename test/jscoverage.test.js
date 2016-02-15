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

var func = jscoverage.genCodeCoverage({
  filename: 'test',
  lines: {1: 0},
  branches: {'1:5_1:9': 0},
  functions: {'1:5': 0},
  statements: {'1:5': 0}
});

var wrapperGlobal = eval('(function(){ var global = {}; var $lines$ = [1]; var $conds$ = {"1_1_1": 0}; var $source$=["var a = a ? 1: 0;"];' + func + ' return global;})');

var _global;

beforeEach(function () {
  _global = wrapperGlobal();
});

describe('lib/jscoverage.js', function () {
  it('jsc inject code shoud work ok', function () {
    function fn() {}
    // mark line
    _global._$jscmd('test', 'line', 1);
    // mark branch
    _global._$jscmd('test', 'branch', '1:5_1:9', fn());
    // mark function
    _global._$jscmd('test', 'function', '1:5');
    // mark statements
    _global._$jscmd('test', 'statement', '1:5');

    expect(_global._$jscoverage['test'].lines[1]).to.eql(1);
    expect(_global._$jscoverage['test'].branches['1:5_1:9']).to.eql(1);
    expect(_global._$jscoverage['test'].functions['1:5']).to.eql(1);
    expect(_global._$jscoverage['test'].statements['1:5']).to.eql(1);
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
  it('should not overwrite existing coverage through inits', function () {
    // Init once
    _global._$jscmd('$file2$', 'init', {
      lines: {1: 0},
      functions: {'1:1': 0},
      branches: {'1:2_1:5': 0},
      statements: {'1:1': 0},
      source: ['abc']
    });
    // mark line
    _global._$jscmd('$file2$', 'line', 1);

    // Init twice
    _global._$jscmd('$file2$', 'init', {lines: {1: 0}, source: [1,2]});
    // mark line again
    _global._$jscmd('$file2$', 'line', 1);

    expect(_global._$jscoverage['$file2$'].lines[1]).to.be(2);
    expect(_global._$jscoverage['$file2$'].branches['1:2_1:5']).to.be(0);
    expect(_global._$jscoverage['$file2$']['source'].length).to.be(1);
  });
});
