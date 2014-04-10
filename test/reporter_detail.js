/*!
 * jscoverage: test/reporter_detail.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var expect = require('expect.js');
var testMod = require('../reporter/detail');
describe('exports.processLinesMask', function () {
  it('should be ok when test1', function () {
    var process = testMod._get('processLinesMask');
    var input  = [0, 0, 0, 1, 1, 0, 0, 1, 0, 0];
    var result = [3, 2, 2, 1, 1, 2, 2, 1, 2, 2];
    expect(process(input)).to.be.eql(result);
  });
  it('should be ok when test2', function () {
    var process = testMod._get('processLinesMask');
    var input  = [0, 0, 1, 1, 0, 0, 1, 0, 1];
    var result = [2, 2, 1, 1, 2, 2, 1, 2, 1];
    expect(process(input)).to.be.eql(result);
  });
  it('should be ok when test3', function () {
    var process = testMod._get('processLinesMask');
    var input  = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
    var result = [2, 2, 1, 2, 2, 3, 0, 0, 0, 3, 2, 2, 1, 2];
    expect(process(input)).to.be.eql(result);
  });
  it('should be ok when test4', function () {
    var process = testMod._get('processLinesMask');
    var input  = [0];
    var result = [0];
    expect(process(input)).to.be.eql(result);
  });

  it('should be ok', function () {
    testMod.process(_$jscoverage, {}, {high: 90, middle: 70, low: 20});
  });
});