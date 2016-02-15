/*!
 * jscoverage: test/cli.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-05-29 10:37:09
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var index = require('../index');
var exec = require('child_process').exec, child;
var path = require('path');
var originArgv = JSON.parse(JSON.stringify(process.argv));
var origCwd = process.cwd();
var fs = require('xfs');
var expect = require('expect.js');

describe('test cli commands', function () {
  before(function (){
    process.chdir(__dirname);
  });

  after(function () {
    fs.unlink(path.join(__dirname, './res/a1-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './res/error-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './res/shebang-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './res/shebang_withbom-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './res/test-cov.coffee'), function(err){});
    process.chdir(origCwd);
  });

  describe('jscoverage file', function () {
    it('should ok cli jscoverage process a file', function (done) {
      exec('../bin/jscoverage res/a1.js --covout=none', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should ok cli jscoverage process a file with shebang', function (done) {
      exec('../bin/jscoverage res/shebang.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should ok cli jscoverage process a file with shebang bom', function (done) {
      exec('../bin/jscoverage res/shebang_withbom.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should catch error when parse file error', function (done) {
      exec('../bin/jscoverage res/error.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.match(/Unexpected identifier/);
        expect(stderr).to.be.empty();
        done();
      });
    });

    it.skip('should ok when parse coffee script', function (done) {
      exec('../bin/jscoverage res/test.coffee', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });

    it('should ok when process res', function (done) {
      exec('../bin/jscoverage ./res/a ./res/test', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.match(/process files: \d+/);
        expect(stderr).to.be.empty();
        expect(fs.existsSync('./res/.git/test.js')).to.not.be.ok();
        expect(fs.existsSync('./res/.DS_Store')).to.not.be.ok();
        fs.sync().rm('./res/test');
        done();
      });
    });
  });
});