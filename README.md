jscoverage
==========
jscoverage tool, both node.js or javascript support

### install
    
```sh
npm install jscoverage
```

### get source code
    
```sh
git clone git://github.com/fishbar/jscoverage.git
```

### using jscoverage with mocha

let mocha load jscoverage using -r options, like:
```sh
mocha \
  -r jscoverage \
  --covignore .covignore \
  --covsummary true \
  --noinject true
  test/dir
```
the case above, mocha do nothing with these options: --covignore , --cvsummary
but jscoverage can recognise them, all support options are here:
  
  --covignore [file] # like gitignore, tell jscoverage to ignore these files

  --covsummary [boolean] # if set true, when mocha finish, jscoverage will print a summary msg

  --noinject [boolean] # switch if inject code for easytest


### using jscoverage as cli command

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

TODO comming soon
```sh
jscoverage sourcedir destdir
```

### using jscoverage programmatically

```js
var jsc = require('jscoverage');
var abc = jsc.require(module, 'testmodule.js');
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
### using inject api for node.js test

```js
var testMod = require('module/for/test.js');

testMod._get('name');
testMod._replace('name', value);
testMod._reset();
testMod._call();
```

### mocha global leaks detect

The follow object will be detected, all of them are created by jscoverage.

  * _$jscoverage
  * _$jscmd

