var jsc = require("../index");
require = jsc.mock(module);

var abc = require('./abc',true);

abc.abc();

process.on('exit',function(){
  jsc.coverage();
});

