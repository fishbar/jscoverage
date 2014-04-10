/*!
 * jscoverage: test/abc.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var cde = require('./cde');
var a = 1;
var b = 2;
var c = 3;
var d;
var e = a > 1 ? 1 : 2;

var reset = {
  abc:function () {}
};

function abc() {
  var tmp = a + b;
  var t = 1;
  // test require ok
  cde.a();
  // test switch coverage
  testSwitch('first');
  /* @covignore */
  testSwitch('second');
  testSwitch();
  return tmp + c;
}

function testSwitch(act) {
  var res = [
    'a',
    'b',
    'c'
  ];
  var tmp;
  switch (act) {
  case 'first' :
    tmp = res[0];
    break;
  case 'second' :
    tmp = res[1];
    break;
  default:
    tmp = res.join(',');
  }
  return tmp;
}
abc();
exports.abc = abc;
