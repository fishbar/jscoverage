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
var fs = require('fs');
var expect = require('expect.js');

describe('test cli commands', function () {
  before(function (){
    process.chdir(__dirname);
  });

  after(function () {
    console.log(process.cwd());
    fs.unlink(path.join(__dirname, './dir/a1-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './dir/error-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './dir/shebang-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './dir/shebang_withbom-cov.js'), function(err){});
    fs.unlink(path.join(__dirname, './dir/test-cov.coffee'), function(err){});
    process.chdir(origCwd);
  });

  describe('jscoverage file', function () {
    it('should ok cli jscoverage process a file', function (done) {
      exec('../bin/jscoverage dir/a1.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should ok cli jscoverage process a file with shebang', function (done) {
      exec('../bin/jscoverage dir/shebang.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should ok cli jscoverage process a file with shebang bom', function (done) {
      exec('../bin/jscoverage dir/shebang_withbom.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should catch error when parse file error', function (done) {
      exec('../bin/jscoverage dir/error.js', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.match(/Unexpected token/);
        expect(stderr).to.be.empty();
        done();
      });
    });
    it('should ok when parse coffee script', function (done) {
      exec('../bin/jscoverage dir/test.coffee', function (error, stdout, stderr) {
        expect(error).to.be(null);
        expect(stdout).to.be.empty();
        expect(stderr).to.be.empty();
        done();
      });
    });
  });
});