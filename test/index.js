/*!
 * jscoverage: test/index.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var fs = require('xfs');
var path = require('path');
var expect = require('expect.js');
var Module = require('module');
var index = require('../index');

index.config({
  get: '_get',
  call: '$$call',
  replace: '_replace',
  reset: '_reset'
});

var abc = require('./abc');

describe("index.js", function () {
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
    it('should ignore exclude', function (done) {
      var source = path.join(__dirname, './dir');
      var dest = path.join(__dirname, './dir-cov');
      index.processFile(source, dest, ['a2', /\.md$/i]);
      expect(fs.existsSync(dest + '/a/a2')).to.not.ok();
      fs.rmdir(dest, function () {
        done();
      });
    });
    it('should throw error when source and dest not currect', function () {
      try {
        index.processFile();
      } catch (e) {
        expect(e.message).to.match(/source is not a file or dir/);
      }
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile('./abc', '.abc.cov');
      }
      expect(_empty).to.throwException(/source is not a file or dir/);
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile(path.join(__dirname, './abdc.js'), '/tmp/abc.cov.js');
      }
      expect(_empty).to.throwException(/source is not a file or dir/);
    });
  });

  describe('exports.processLinesMask', function () {
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

  describe('exports.processLinesMask', function () {
    var orig_log = console.log;
    var msg = [];
    console.log = function (message) {
      msg.push(message);
    };
    index.coverageDetail();
    index.coverage();
    console.log = orig_log;
  });

  describe('test Module.extension[".js"]', function () {
    it('should return a function', function (done) {
      var module = {
        _compile: function (content, filename) {
          var ff = new Function ('require', 'module', 'exports', '__dirname', '__filename', content + ';return module.exports;');
          var module = {exports: {}};
          var mo = ff(require, module, module.exports, __dirname, filename);
          mo._replace('d', [
            undefined,
            null,
            1,
            NaN,
            'string',
            [1, 2, 3],
            {'abc': [1, 2, 3]},
            /a\\\\b/g
          ]);
          var res = mo._get('d');
          expect(res[0]).to.be(undefined);
          expect(res[1]).to.be(null);
          expect(res[2]).to.be(1);
          expect(isNaN(res[3])).to.be.ok();
          expect(res[7].test('a\\\\bc')).to.be.ok();
          mo._reset();
          expect(mo._get('d')).to.be(undefined);
          done();
        }
      };
      Module._extensions['.js'](module, path.join(__dirname, './abc.js'), {
        needjsc : true,
        flagjsc : true,
        needinject : true
      });
    });
    it('should return a function', function (done) {
      var module = {
        _compile: function (content, filename) {
          var ff = new Function ('require', 'module', 'exports', '__dirname', '__filename', content + ';return module.exports;');
          var module = {exports: {}};
          var mo = ff(require, module, module.exports, __dirname, filename);
          mo._replace('d', {});
          var res = mo._get('d');
          expect(res).to.be.eql({});
          mo._reset();
          expect(mo._get('d')).to.be(undefined);
          done();
        }
      };
      Module._extensions['.js'](module, path.join(__dirname, './abc.js'), {
        needjsc : true,
        flagjsc : true,
        needinject : true
      });
    });
  });
  describe("test reset", function () {
    it('should return a abc', function () {
      abc._replace('reset.abc', 123);
      expect(abc._get('reset.abc')).to.be(123);
      abc._reset();
      expect(abc._get('reset.abc')).to.be.a('function');
    });
  });
});

process.on('exit', function () {
  //jsc.coverageDetail();
});
