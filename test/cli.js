/*!
 * jscoverage: test/cli.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-05-29 10:37:09
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var index = require('../index');
var originArgv = JSON.parse(JSON.stringify(process.argv));
describe('test cli commands', function () {
  afterEach(function () {
    process.argv = originArgv;
  });
  describe('--coverage', function () {
    it('should ok when set --coverage=50,60,70', function () {
      process.argv = ['coverage']
    });
  });
});