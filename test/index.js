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
    it('should throw error when path not file', function () {
      var source = path.join(__dirname, './dir');
      var dest = path.join(__dirname, './abc.cov.js');
      var err;
      try {
        index.processFile(source, dest);
      } catch (e) {
        err = e;
      }
      expect(err.message).to.match(/path is dir/);
    });
    it('should throw error when path is a socket file', function (done) {
      var net = require('net');
      var serv = net.createServer(function(client){});
      var ff = path.join(__dirname, './dir/a.sock');
      serv.listen(ff, function (err) {
        try {
          index.processFile(ff, path.join(__dirname, './dir/sock-cov'));
        } catch (e) {
          expect(e.message).to.match(/not a regular file/);
        }
        serv.close(done);
      });
    });
    /*
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
    */
    it('should throw error when source and dest not currect', function () {
      try {
        index.processFile();
      } catch (e) {
        expect(e.message).to.match(/path must be a string/);
      }
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile('./abc', '.abc.cov');
      }
      expect(_empty).to.throwException(/no such file or directory/);
    });
    it('should throw error when source and dest not currect', function () {
      function _empty() {
        index.processFile(path.join(__dirname, './abdc.js'), '/tmp/abc.cov.js');
      }
      expect(_empty).to.throwException(/no such file or directory/);
    });
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
  
  describe('getLCOV', function () {
    it('should be ok', function () {
      var res = index.getLCOV();
      expect(res).to.match(/end_of_record/);
      expect(res).to.match(/SF:/);
      expect(res).to.match(/DA:\d+,\d+/);
    });
  });
});
