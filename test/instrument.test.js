var testMod = require('../lib/instrument_2.js');
var expect = require('expect.js');
var fs = require('fs');
var path = require('path');

describe('reporter/instrument.js', function () {
  var ist;
  beforeEach(function () {
    ist = new testMod();
  });
  describe('ist.process(file, code) conditions instrument', function () {
    it('should ok when if (a) {}', function () {
      ist.process('test', 'if (a>b){}');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if (_$jscmd("test", "branch", "1:4_1:7", a>b)){_$jscmd("test", "statement", "1:9");}');
    });

    it('should ok when if (a > b) {}', function () {
      ist.process('test', 'if (a){}');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if (_$jscmd("test", "branch", "1:4_1:5", a)){_$jscmd("test", "statement", "1:7");}');
    });

    it('should ok when ||', function () {
      ist.process('test', 'if (a > c || a > b){}');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if (_$jscmd("test", "branch", "1:4_1:9", a > c) || _$jscmd("test", "branch", "1:13_1:18", a > b)){_$jscmd("test", "statement", "1:20");}');
    });

    it('should ok when &&', function () {
      ist.process('test', 'if (a > c && a > b){}');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if (_$jscmd("test", "branch", "1:4_1:9", a > c) && _$jscmd("test", "branch", "1:13_1:18", a > b)){_$jscmd("test", "statement", "1:20");}');
    });

    it('should ok when instanceof', function () {
      ist.process('test', 'if (a instanceof b){}');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if (_$jscmd("test", "branch", "1:4_1:18", a instanceof b)){_$jscmd("test", "statement", "1:20");}');
    });

    it('should ok when ? : 1', function () {
      ist.process('test', 'var a = b ? c : d;');
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = b ? _$jscmd("test", "branch", "1:12_1:13", c) : _$jscmd("test", "branch", "1:16_1:17", d);');
    });
  });

  describe('ist.process(file, code) line instrument', function () {
    it('should work fine when multi-line', function () {
      var code = 'var a = `test\nsdfsd`;var b = 1';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = `test\nsdfsd`;_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:7");var b = 1');
    });
    it('should work fine with multiline var Declaration', function () {
      var code = 'var a,\nb,\nc;';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a,\nb,\nc;');
    });
    it('should work fine with object def', function () {
      var code = 'var a = {a:1,\n b:2};';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = {a:1,\n b:2};');
    });
    it('should work fine with switch statements', function () {
      var code = 'switch(a) {\n case 1:\nbreak}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");switch(a) {\n case 1:\n_$jscmd("test", "line", 3);_$jscmd("test", "statement", "3:0");break}');
    });
    it('should work fine with ifStatement', function () {
      var code = 'if(a){\n}else{\n}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if(_$jscmd("test", "branch", "1:3_1:4", a)){_$jscmd("test", "statement", "1:6");\n}else{_$jscmd("test", "statement", "2:6");\n}');
    });
    it('should work fine with ifStatement without blockStatment', function () {
      var code = 'if(a)\na++;\nelse if (b)\nb++;\nelse\nc++';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if(_$jscmd("test", "branch", "1:3_1:4", a))\n{_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:0");a++;}\nelse if (_$jscmd("test", "branch", "3:9_3:10", b))\n{_$jscmd("test", "line", 4);_$jscmd("test", "statement", "4:0");b++;}\nelse\n{_$jscmd("test", "line", 6);_$jscmd("test", "statement", "6:0");c++}');
    });
    it('should work fine with complicate ifStatement', function () {
      var code = 'if(\n(a>b && a<c) ||\n (b>c && b<a)\n){\n}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");if(\n(_$jscmd("test", "branch", "2:1_2:4", a>b) && _$jscmd("test", "branch", "2:8_2:11", a<c)) ||\n (_$jscmd("test", "branch", "3:2_3:5", b>c) && _$jscmd("test", "branch", "3:9_3:12", b<a))\n){_$jscmd("test", "statement", "4:2");\n}');
    });
    it('should work fine with a||b', function () {
      var code = 'a||b';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");_$jscmd("test", "branch", "1:0_1:1", a)||_$jscmd("test", "branch", "1:3_1:4", b)');
    });
    it('should work fine with a = a||b', function () {
      var code = 'a = a||b';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");a = _$jscmd("test", "branch", "1:4_1:5", a)||_$jscmd("test", "branch", "1:7_1:8", b)');
    });
    it('should work fine with a > b', function () {
      var code = 'a>b';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");a>b');
    });
    it('should work fine with do-while', function () {
      var code = 'do {\na++\n}\nwhile(a)';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");do {_$jscmd("test", "statement", "1:4");\n_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:0");a++\n}\nwhile(_$jscmd("test", "branch", "4:6_4:7", a))');
    });
    it('should fine with while(){}', function () {
      var code = 'while(a){\na++;\n}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");while(_$jscmd("test", "branch", "1:6_1:7", a)){_$jscmd("test", "statement", "1:9");\n_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:0");a++;\n}');
    });
    it('should fine with  with(a){}', function () {
      var code = 'with(a){\nv=123;\n}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");with(a){_$jscmd("test", "statement", "1:8");\n_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:0");v=123;\n}');
    });
    it('should fine with annonim', function () {
      var code = '(function(){\n})(a,b)';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");(function(){_$jscmd("test", "function", "1:12_2:0");_$jscmd("test", "statement", "1:12");\n})(a,b)');
    });
  });

  describe('ist.process(file, code) statement instrument', function () {
    it('should work fine when single line with multi statement', function () {
      var code = 'var a = 1; a += 1; a /= 1';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = 1; _$jscmd("test", "statement", "1:11");a += 1; _$jscmd("test", "statement", "1:19");a /= 1');
    });

    it('should fine when for...in', function () {
      var code = 'for(var i \nin a);';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");for(var i \nin a){_$jscmd("test", "statement", "2:5");;}');
    });
    it('should fine when for...in', function () {
      var code = 'for(var i \nin a) \na++;';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");for(var i \nin a) \n{_$jscmd("test", "line", 3);_$jscmd("test", "statement", "3:0");a++;}');
    });
  });

  describe('ist.process(file, code) function instrument', function () {
    it('should work fine with FunctionDeclaration ', function () {
      var code = 'function a(b) {return b++;}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");function a(b) {_$jscmd("test", "function", "1:15_1:26");_$jscmd("test", "statement", "1:15");return b++;}');
    });
    it('should work fine with FunctionExpression', function () {
      var code = 'var a = function (b) {return b++;}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = function (b) {_$jscmd("test", "function", "1:22_1:33");_$jscmd("test", "statement", "1:22");return b++;}');
    });
    it('should work fine with single expression arrayfunction', function () {
      var code = 'var a = ()=> 2';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = ()=> {_$jscmd("test", "function", "1:13_1:14");return 2}');
    });
    it('should work fine with multi-line arrayfunction', function () {
      var code = 'var a = ()=> {b ++;\nreturn b}';
      ist.process('test', code);
      expect(ist.code).to.eql('_$jscmd("test", "line", 1);_$jscmd("test", "statement", "1:0");var a = ()=> {_$jscmd("test", "function", "1:14_2:8");_$jscmd("test", "statement", "1:14");b ++;\n_$jscmd("test", "line", 2);_$jscmd("test", "statement", "2:0");return b}');
    });
  });
});
