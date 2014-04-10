/*!
 * jscoverage: test/cde.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-10 16:23:23
 * CopyRight 2014 (c) Fish And Other Contributors
 */
function a(){
  var a = 1;
  var b = 2;
  if (a || b > a) {
    console.log(a);
  }
  return a+b;
}
exports.a = a;