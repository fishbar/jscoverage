/*!
 * jscoverage: test/test.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var expect = require('expect.js');
var abc = require('../example.js');
describe('test', function () {
  it('should be ok', function () {
    expect('123').to.be('123');
    console.log(abc._get('example'));
  });
});