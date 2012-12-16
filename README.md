jscoverage
==========
jscoverage tool, both node or javascript support

### install 
  
    npm install jscoverage -g

### using as cli command
```shell
jscoverage
# print help info
jscoverage source.js
# convert source.js to source-cov.js
jscoverage source.js dest.js
# convert source.js to dest.js
jscoverage sourcedir destdir --exclude a.js,b.js,c.js
# convert all files in sourcedir to destdir, exclude list will be ignored
```

### using as node module
```js
var jsc = require('jscoverage').init(mo);
var abc = jsc.require('testmodule.js', true);
describe('test', function () {
    // TEST CODE HERE
});
```
==== or =====
```js
var jsc = require('jscoverage');
require = jsc.mock(mo);
var abc = require('abc.js', true);
describe('test', function () {
    // TEST CODE HERE
});
```

### dependence
  uglify-js

## thanks
  piuccio/node-coverage https://github.com/piuccio/node-coverage



