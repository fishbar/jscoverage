jscoverage
==========
  jscoverage tool, both node or javascript support

### install 
  npm install jscoverage -g

    this.is.code(abc);
### cli command
  > jscoverage
  print help info
  > jscoverage source.js
  convert source.js to source-cov.js
  > jscoverage source.js dest.js
  convert source.js to dest.js
  > jscoverage sourcedir destdir --exclude a.js,b.js,c.js
  convert all files in sourcedir to destdir, exclude list will be ignored

### using as node module
  
  var jsc = require('jscoverage').init(mo);
  var abc = jsc.require('testmodule.js', true);
  describe('test', function () {
    // CODE
  });

  ==== or =====
  var jsc = require('jscoverage').init(mo);
  require = jsc.mock();
  var abc = require('abc.js', true);
  describe('test', function () {
    // CODE 
  });

### dependence
  uglify-js

## thanks
  piuccio/node-coverage https://github.com/piuccio/node-coverage



