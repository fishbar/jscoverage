var cde = require('./cde');
var a = 1;
var b = 2;
var c = 3;

function abc(){
  var tmp = a + b;
  return tmp + c;
}

function uncovered(){
  // TODO code here
  var str = "this function is not covered";
  return str;
}
exports.abc = abc;