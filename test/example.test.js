/*!
 * jscoverage: example.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-04-03 15:20:13
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var expect = require('expect.js');

exports.testTryCatch = function (a) {
  try {
    return a.run();
  } catch (e) {
    return 'catch error';
  }
};

exports.testIfElse = function (a, b, c, d) {
  if (a > 0 && b > 0) {
    return 'ab';
  } else if (c || d) {
    return 'cd';
  } else {
    return 'unknow';
  }
};

exports.testCondition = function (a, b ,c) {
  return a || b > c ? '1' : '2';
};

exports.testWhile = function () {
  var a = 0;
  var res = '';
  while(a < 2) {
    res += 'a';
    a ++;
  }
  var b = 0;
  do {
    res += 'b';
    b ++;
  } while (b < 2);
  return res;
};


describe('example.js', function () {
  it('test try catch', function () {
    expect(exports.testTryCatch({})).to.be.match(/catch\ error/);
    expect(exports.testTryCatch({run: function () {return 'run';}})).to.be('run');
  });

  it('test if else', function () {
    expect(exports.testIfElse(1, 0)).to.be('unknow');
    expect(exports.testIfElse(1, 1)).to.be('ab');
    expect(exports.testIfElse(0, 0, 1, 0)).to.be('cd');
  });

  it('test condition', function () {
    expect(exports.testCondition(1)).to.be('1');
    expect(exports.testCondition(0, 2, 1)).to.be('1');
    expect(exports.testCondition(0, 0, 0)).to.be('2');
  });

  it('test while', function () {
    expect(exports.testWhile()).to.be('aabb');
  });

  it('test switch', function () {
    expect(exports.testSwitch('a')).to.be('a');
    expect(exports.testSwitch('b')).to.be('b');
    expect(exports.testSwitch('c')).to.be('c');
    expect(exports.testSwitch('0')).to.be('d');
  });

  it('test for', function () {
    expect(exports.testFor()).to.be(1);
  });

  it('test binary', function () {
    expect(exports.testBinary('a')).to.be('a');
    expect(exports.testBinary(null, 'b')).to.be('b');
    expect(exports.testBinary(null, null, null, 'b')).to.be('b');
    expect(exports.testBinary(null, null, 'b')).to.be('b');
  });
});

exports.testSwitch = function (a) {
  var res = null;
  switch (a) {
    case 'a':
      return 'a';
    case 'b':
      return 'b';
    case 'c':
      res = 'c';
      break;
    default:
      res = 'd';
  }
  return res;
};

exports.testFor = function () {
  var a = 0;
  for (var i = 0; i < 3; i++) {
    if (i > 1) {
      a ++;
    }
  }
  return a;
};
exports.testBinary = function (a, b, c, d) {
  return a || b || c || d;
};
// anonymous function
(function(){
  var a = 1;
  console.log('this line should covered');
})();