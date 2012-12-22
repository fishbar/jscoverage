var jsc = require('../index');
var expect = require('expect.js');

var coverage = jsc.require(module, '../lib/jscoverage');

describe("lib/jscoverage.js", function () {
  describe("abc.abc()", function () {
    it('should be ok', function () {
      expect('123').to.be('123');
      expect(abc.abc()).to.be(6);
    });
  });
  describe("exports.enableModuleCache", function () {
    it('should change patch.enableModuleCache', function () {
      index.enableModuleCache(true);
      expect(index._get('patch.enableModuleCache')).to.be.ok();
    });
  });
});