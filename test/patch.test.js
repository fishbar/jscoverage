/*!
 * jscoverage: test/patch.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var patch = require('../lib/patch');
var expect = require('expect.js');
var checkModule = patch._get('checkModule');

describe('patch.js', function () {
  describe('checkModule()', function () {
    it('should return false when native module', function () {
      expect(checkModule('fs')).to.be(false);
    });
    it('should return false when /node_modules/ module', function () {
      expect(checkModule(process.cwd() + '/node_modules/fs')).to.be(false);
    });
    it('should return false when native module', function () {
      expect(checkModule('fs')).to.be(false);
    });
    it('should return true when ignore no match', function () {
      expect(checkModule('/abc/def')).to.be(true);
    });
    it('should return true when ignore no match', function () {
      patch.setCovIgnore([/\/tet\/a.js/]);
      expect(checkModule('/tet/a.js')).to.be(false);
    });
  });

  describe('require()', function () {
    it('should be ok when require a json file', function () {
      var a = require('./dir/test.json');
      expect(a.test).to.be(1);
    });
  });
});