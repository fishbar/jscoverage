var jsc = require('../index');
var expect = require('expect.js');
var index = jsc.require(module, '../index');
var fs = require('xfs');
var path = require('path');

var abc = jsc.require(module, './abc');

describe("index.js", function () {
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

  describe("exports.config", function () {
    it('should change patch.injectFunctions', function () {
      index.config({
        get: '__get',
        replace : '$$replace'
      });
      var cfg = index._get('patch.injectFunctions');
      expect(cfg.get).to.be('__get');
      expect(cfg.replace).to.be('$$replace');
      expect(cfg.reset).to.be('_reset');
    });
  });

  describe("exports.processFile", function () {
    it('should return an jsc convert file', function () {
      var source = path.join(__dirname, './abc.js');
      var dest = path.join(__dirname, './abc.cov.js');
      index.processFile(source, dest);
      expect(fs.existsSync(dest)).to.be(true);
      expect(fs.readFileSync(dest)).to.match(/_\$jscoverage/);
      fs.unlinkSync(dest);
    });
    it('should return an jsc convert dir', function (done) {
      var source = path.join(__dirname, './dir');
      var dest = path.join(__dirname, './dir-cov');
      index.processFile(source, dest);
      expect(fs.existsSync(dest)).to.be(true);
      expect(fs.readFileSync(dest + '/a1.js')).to.match(/_\$jscoverage/);
      expect(fs.readFileSync(dest + '/a/a2')).to.match(/_\$jscoverage/);
      fs.rmdir(dest, function () {
        done();
      });
    });
    it('should egnore exclude', function (done) {
      var source = path.join(__dirname, './dir');
      var dest = path.join(__dirname, './dir-cov');
      index.processFile(source, dest, ['a2', /\.md$/i]);
      expect(fs.existsSync(dest + '/a/a2')).to.not.ok();
      fs.rmdir(dest, function () {
        done();
      });
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile();
      }
      expect(_empty).to.throwException(/abs source path or abs dest path needed!/);
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile('./abc', '.abc.cov');
      }
      expect(_empty).to.throwException(/abs source path or abs dest path needed!/);
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile(path.join(__dirname, './abdc.js'), '/tmp/abc.cov.js');
      }
      expect(_empty).to.throwException(/source is not a file or dir/);
    });
  });

  describe("exports.mock", function () {
    it('should return an require function', function () {
      var req = index.mock(module, require);
      expect(req).to.be.a('function');
      expect(req).to.have.keys(['cache']);
      var abc = req('./abc', true);
      expect(abc.abc()).to.be(6);
      expect(abc._get).to.be.a('function');
    });
  });

  describe("exports.require", function () {
    it('should return an require function', function () {
      var abc = index.require(module, './abc');
      expect(abc.abc()).to.be(6);
      expect(abc._get).to.be.a('function');
    });
    it('should return error when file is empty', function () {
      function _empty() {
        index.require(module);
      }
      expect(_empty).to.throwException(/usage:jsc.require/);
    });
  });

  describe("exports.processLinesMask", function () {
    it('should be ok when test1', function () {
      var process = index._get('processLinesMask');
      var input  = [0, 0, 0, 1, 1, 0, 0, 1, 0, 0];
      var result = [3, 2, 2, 1, 1, 2, 2, 1, 2, 2];
      expect(process(input)).to.be.eql(result);
    });
    it('should be ok when test2', function () {
      var process = index._get('processLinesMask');
      var input  = [0, 0, 1, 1, 0, 0, 1, 0, 1];
      var result = [2, 2, 1, 1, 2, 2, 1, 2, 1];
      expect(process(input)).to.be.eql(result);
    });
    it('should be ok when test3', function () {
      var process = index._get('processLinesMask');
      var input  = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
      var result = [2, 2, 1, 2, 2, 3, 0, 0, 0, 3, 2, 2, 1, 2];
      expect(process(input)).to.be.eql(result);
    });
    it('should be ok when test4', function () {
      var process = index._get('processLinesMask');
      var input  = [0];
      var result = [0];
      expect(process(input)).to.be.eql(result);
    });
  });

  describe("exports.processLinesMask", function () {
    var orig_log = console.log;
    var msg = [];
    console.log = function (message) {
      msg.push(message);
    };
    index.coverageDetail();
    index.coverage();
    console.log = orig_log;
  });
});

process.on('exit', function () {
  jsc.coverage();
  jsc.coverageDetail();
});