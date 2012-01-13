describe("utilities", function() {
  var obj = {
        a : 1,
        b : 2,
        c : 3
      };

  beforeEach(function() {
    dojo.require('toura.Utilities');
  });

  describe("dojo.forIn", function() {
    it("should use window as its scope if none is provided", function() {
      var scope;

      dojo.forIn(obj, function(k, v) {
        scope = this;
      });

      expect(scope).toBe(window);
    });

    it("should use a different scope if one is provided", function() {
      var scope;

      dojo.forIn(obj, function(k, v) {
        scope = this;
      }, obj);

      expect(scope).toBe(obj);
    });

    it("should iterate over the object", function() {
      var str = '', num = 0;

      dojo.forIn(obj, function(k, v) {
        str += k;
        num += v;
      });

      expect(str).toBe('abc');
      expect(num).toBe(6);
    });
  });

  describe("toura.util.truncate", function() {
    it("should return a truncated string with HTML stripped", function() {
      var str = "<p>Lorem ipsum foo bar baz</p>";
      var truncated = toura.util.truncate(str, 10);
      expect(truncated).toBe('Lorem ipsu &hellip;');
    });

    it("should not add a &hellip; if no truncation was required", function() {
      var str = "<p>Lorem ipsum foo bar baz</p>";
      var truncated = toura.util.truncate(str, 200);
      expect(truncated).toBe('Lorem ipsum foo bar baz');
    });
  });

  describe("toura.util.copyStyles", function() {
    it("should copy styles from one element to another", function() {
      var t = dojo.byId('test'),
        fromEl = dojo.create('div', {
          style : {
            color : 'blue',
            width : '99px',
            height : '199px'
          }
        }, t),
        toEl = dojo.create('div', null, t, 'last');

      toura.util.copyStyles(fromEl, toEl, ['color', 'width']);

      expect(
        dojo.style(toEl, 'color')
      ).toBe(
        dojo.style(fromEl, 'color')
      );

      expect(
        dojo.style(toEl, 'width')
      ).toBe(
        dojo.style(fromEl, 'width')
      );

      expect(
        dojo.style(toEl, 'height')
      ).not.toBe(
        dojo.style(fromEl, 'height')
      );
    });
  });

  describe('toura.jsonp', function() {
    it("should return a promise", function() {
      var ret = toura.jsonp('http://search.twitter.com/search.json?q=toura');
      expect(ret.then).toBeDefined();
    });

    it("should resolve the promise with the returned data", function() {
      var ret = toura.jsonp('http://search.twitter.com/search.json?q=toura'),
          flag = false;

      runs(function() {
        ret.then(function(data) { flag = data; });
      });

      waits(500);

      runs(function() {
        expect(flag).toBeTruthy();
      });
    });

    it("should accept just a config object", function() {
      var ret = toura.jsonp({
            url : 'http://search.twitter.com/search.json?q=toura',
            load : function() { flag = true; }
          }),
          flag = false;

      waits(500);

      runs(function() {
        expect(flag).toBeTruthy();
      });
    });

    it("should accept a url and a config object", function() {
      var ret = toura.jsonp('http://search.twitter.com/search.json?q=toura', {
            load : function() { flag = true; }
          }),
          flag = false;

      waits(500);

      runs(function() {
        expect(flag).toBeTruthy();
      });
    });
  });
});
