var testMod = require('../reporter/util.js');
var expect = require('expect.js');

describe('reporter/util.js', function () {
  describe('util.getType(covlevel, coverage)', function () {
    var covlevel = {
      high: 0.9,
      middle: 0.8,
      low: 0.6
    };
    it('should return green', function () {
      var res = testMod.getType(covlevel, 0.9);
      expect(res[0]).to.eql('GREEN');
    });
    it('should return null', function () {
      var res = testMod.getType(covlevel, 0.8);
      expect(res[0]).to.eql(null);
    });
    it('should return yellow', function () {
      var res = testMod.getType(covlevel, 0.6);
      expect(res[0]).to.eql('YELLOW');
    });
    it('should return red', function () {
      var res = testMod.getType(covlevel, 0.5);
      expect(res[0]).to.eql('RED');
    });
  });

  describe('util.colorful(str, type)', function () {
    it('should return green', function () {
      var res = testMod.colorful('test');
      expect(res).to.eql('test');
    });
    it('should return green', function () {
      var res = testMod.colorful('test', 'GREEN');
      expect(res).match(/test/);
      expect(res).match(/\x1B/);
    });
  });
});