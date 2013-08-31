(function() {

  (function($) {
    var console, evalScript, fdiv, fixtureHTML, outerHTML, rollbackFixture;
    console = window.console;
    fdiv = function() {
      return $("#qunit-fixture");
    };
    fixtureHTML = null;
    outerHTML = $.elementDiff.outerHTML;
    rollbackFixture = function() {
      return fdiv().html(fixtureHTML);
    };
    evalScript = function(script) {
      /* jshint -W054
      */

      var f;
      f = new Function("$", script.join(';'));
      return f.call(this, $);
    };
    module("jquery-elementDiff", {
      setup: function() {
        this.fdiv = fdiv();
        if (fixtureHTML) {
          return this.fdiv.html(fixtureHTML);
        } else {
          return fixtureHTML = this.fdiv.html();
        }
      }
    });
    test(':nullDeeply', function() {
      return deepEqual($.elementDiff.nullDeeply({
        a: 1,
        b: {
          c: 1
        }
      }), {
        a: null,
        b: {
          c: null
        }
      });
    });
    test(':isEmptyObject', function() {
      ok($.elementDiff.isEmptyObject({}, 'returns true for empty object'));
      ok(!$.elementDiff.isEmptyObject({
        a: 1
      }, 'returns false for object with property'));
      ok(!$.elementDiff.isEmptyObject(null, 'returns false if it is null'));
      ok(!$.elementDiff.isEmptyObject('foo', 'returns false if it is a string'));
      ok(!$.elementDiff.isEmptyObject(1, 'returns false if it is a number'));
      ok(!$.elementDiff.isEmptyObject(true, 'returns false if it is a boolean'));
      return ok(!$.elementDiff.isEmptyObject(false, 'returns false if it is a boolean'));
    });
    test(':diffObjects', function() {
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: 1
      }), {}, 'returns empty object for non-diff objects');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: 2
      }), {
        a: 2
      }, 'returns diff');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: '1'
      }), {
        a: '1'
      }, 'returns diff with different types');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: true
      }), {
        a: true
      }, 'returns diff with different types');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: null
      }), {
        a: null
      }, 'returns diff when property changed to be null');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {}), {
        a: void 0
      }, 'returns diff when property set property null');
      deepEqual($.elementDiff.diffObjects({
        a: 1
      }, {
        a: 1,
        b: 2
      }), {
        b: 2
      }, 'returns diff with new property');
      return deepEqual($.elementDiff.diffObjects({
        a: 1,
        b: {
          c: 1
        }
      }, {
        a: 1,
        b: {
          c: 2
        }
      }), {
        b: {
          c: 2
        }
      }, '');
    });
    test(':flattenAttributes', function() {
      return deepEqual($.elementDiff.flattenAttributes({
        a: 1,
        b: {
          _: 2,
          c: 3,
          d: {
            _: 4,
            e: 5,
            f: null,
            g: false,
            h: '6'
          }
        }
      }), {
        'a': 1,
        'b': 2,
        'b-c': 3,
        'b-d': 4,
        'b-d-e': 5,
        'b-d-f': null,
        'b-d-g': false,
        'b-d-h': '6'
      }, 'generates object with attribute naming rule');
    });
    test('#generateCode', function() {
      var ed;
      ed = $('#test1 > a').elementDiff();
      equal(ed.generateCode('foo'), 'foo()', 'generates code with no arguments');
      equal(ed.generateCode('foo', 1, '2', null, false, true), 'foo(1,"2",null,false,true)', 'generates code with arguments');
      return equal(ed.generateCode('foo', NaN, {
        a: function() {
          return 1;
        }
      }, function() {
        return 2;
      }), 'foo(null,{})', 'should ignore functions');
    });
    test('#diffAttributes', function() {
      var diff, ed;
      ed = $('#test1 > a').elementDiff();
      diff = ed.diffAttributes('<a href="#foo2" data-foo="1" data-foo-bar="2" data-foo-bar-baz2="3" foo="false">Yay</a>');
      deepEqual(diff, ['attr({"href":"#foo2","data-foo-bar-baz":null,"data-foo-bar-baz2":3,"foo":false})'], "returns attr method with diff");
      diff = ed.diffAttributes('<a>Yay</a>');
      return deepEqual(diff, ['attr({"href":null,"data-foo":null,"data-foo-bar":null,"data-foo-bar-baz":null,"foo":null})']);
    });
    test('#diffText', function() {
      var diff, ed;
      ed = $('#test1 > a').elementDiff();
      diff = ed.diffText('<a>Hoo</a>');
      deepEqual(diff, ['text("Hoo")']);
      ed = $('#test1').elementDiff();
      diff = ed.diffText('<div>Hoo</div>');
      return deepEqual(diff, ['empty()', 'text("Hoo")']);
    });
    test('#isSameTag', function() {
      var ed;
      ed = $('#test1 > a').elementDiff();
      ok(ed.isSameTag('<a href="#foo">Yay</a>'), 'returns true for same tag');
      return ok(!ed.isSameTag('<b>Yay</b>'), 'returns true for different tag');
    });
    test('#diff', function() {
      var ed;
      ed = $('#test1 > a').elementDiff();
      deepEqual(ed.diff('<a href="#foo">Yay</a>'), ['$("#test1 > a").attr({"data-foo":null,"data-foo-bar":null,"data-foo-bar-baz":null,"foo":null})']);
      deepEqual(ed.diff('<b>Hoo</b>'), ['$("#test1 > a").replaceWith("<b>Hoo</b>")']);
      ed = $('#test1').elementDiff();
      return deepEqual(ed.diff('<div>Hoo</div>'), ['$("#test1").attr({"id":null}).empty().text("Hoo")']);
    });
    return test('#getDiffRecursive', function() {
      var clone, diff, ed;
      ed = $('#test1 > a').elementDiff();
      diff = ed.diffRecursive('<b>Yay</b>');
      deepEqual(diff, ['$("#test1 > a").replaceWith("<b>Yay</b>")']);
      evalScript(diff);
      equal($.trim($("#test1").html()), '<b>Yay</b>', 'replaces with bold tag');
      rollbackFixture();
      diff = ed.diffRecursive('<a>Foo</a>');
      deepEqual(diff, ['$("#test1 > a").attr({"href":null,"data-foo":null,"data-foo-bar":null,"data-foo-bar-baz":null,"foo":null}).text("Foo")']);
      evalScript(diff);
      equal($.trim($("#test1").html()), '<a>Foo</a>', 'updates text and attributes');
      rollbackFixture();
      ed = $('#test1').elementDiff();
      diff = ed.diffRecursive('<div id="test1-1"><a href="http://www.google.com/" data-bar="foo" foo="1">Hoo</a><b>Baa</b></div>');
      deepEqual(diff, ['$("#test1 > :eq(0)").attr({"href":"http://www.google.com/","data-foo":null,"data-foo-bar":null,"data-foo-bar-baz":null,"data-bar":"foo","foo":1}).text("Hoo")', '$("#test1").append("<b>Baa</b>")', '$("#test1").attr({"id":"test1-1"})']);
      evalScript(diff);
      equal(outerHTML($("#test1-1")), '<div id="test1-1"><a href="http://www.google.com/" foo="1" data-bar="foo">Hoo</a><b>Baa</b></div>');
      rollbackFixture();
      diff = ed.diffRecursive('<div id="test1-2">aa</div>');
      deepEqual(diff, ['$("#test1").attr({"id":"test1-2"}).empty().text("aa")']);
      evalScript(diff);
      equal(outerHTML($("#test1-2")), '<div id="test1-2">aa</div>');
      rollbackFixture();
      ed = $('#test-list1').elementDiff();
      clone = $("#test-list2").clone();
      clone.attr("id", "test-list2-2");
      diff = ed.diffRecursive(clone);
      deepEqual(diff, ['$("#test-list1 > :eq(0) > :eq(0)").attr({"class":"item1"})', '$("#test-list1 > :eq(0) > :eq(2) > :eq(0)").attr({"href":"http://www.yahoo.com/?foo"}).text("Yahoo!!")', '$("#test-list1 > :eq(0)").attr({"class":"list2"})', '$("#test-list1").attr({"id":"test-list2-2"})'], 'diff with test-list2');
      evalScript(diff);
      equal(outerHTML($("#test-list2-2")), outerHTML(clone));
      rollbackFixture();
      ed = $('#test-list1').elementDiff();
      clone = $("#test-list3").clone();
      clone.attr("id", "test-list3-2");
      diff = ed.diffRecursive(outerHTML(clone));
      deepEqual(diff, ['$("#test-list1 > :eq(0) > :eq(0)").attr({"class":"item1"})', '$("#test-list1 > :eq(0) > :eq(3)").remove()', '$("#test-list1 > :eq(0) > :eq(2)").remove()', '$("#test-list1").attr({"id":"test-list3-2"})'], 'diff with test-list3');
      evalScript(diff);
      equal(outerHTML($("#test-list3-2")), outerHTML(clone));
      rollbackFixture();
      ed = $('#test-list1').elementDiff();
      clone = $("#test-list4").clone();
      clone.attr("id", "test-list4-2");
      diff = ed.diffRecursive(outerHTML(clone));
      deepEqual(diff, ['$("#test-list1 > :eq(0)").replaceWith("<ol class=\\"list1\\"><li class=\\"item1\\"><a href=\\"http://www.apple.com/\\">Apple</a></li><li class=\\"item\\"><a href=\\"http://www.microsoft.com/\\" id=\\"link-microsoft\\">Microsoft</a></li></ol>")', '$("#test-list1").attr({"id":"test-list4-2"})'], 'diff with test-list4');
      evalScript(diff);
      equal(outerHTML($("#test-list4-2")), outerHTML(clone));
      return rollbackFixture();
    });
  })(jQuery);

}).call(this);
