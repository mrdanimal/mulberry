describe("toura ui", function() {
  var ui, createUI, currentPageClass;

  beforeEach(function() {
    currentPageClass = [];

    mulberry.app.PhoneGap = {
      present : true,
      network : {
        isReachable : function() {
          var dfd = new dojo.Deferred();
          dfd.resolve(true);
          return dfd.promise;
        }
      }
    };

    mulberry.app.UI = {
      currentPage : {
        addClass : function(c) {
          currentPageClass.push(c);
        },
        removeClass : function(c) {
          currentPageClass = dojo.filter(currentPageClass, function(k) {
            return k !== c;
          });
        },
        hasClass : function(c) {
          return dojo.some(currentPageClass, function(k) {
            return k === c;
          });
        },
        baseObj : {
          isHomeNode : false
        }
      },
      showPage : function() { },
      set : function() { },
      addPersistentComponent : function(C) {
        return new C();
      }
    };

    dojo.require('toura.UI');

    createUI = function() {
      return new toura.UI();
    };
  });

  it("should add classes for feature flags to the body", function() {
    var b = dojo.body();

    toura.features = {
      foo : true,
      baz : false
    };

    ui = createUI();

    expect(dojo.hasClass(b, 'feature-foo')).toBeTruthy();
    expect(dojo.hasClass(b, 'feature-bar')).toBeFalsy();
  });

  describe("sibling nav", function() {
    it("should create the sibling nav if it is enabled", function() {
      toura.features.siblingNav = true;
      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent').andCallThrough();
      ui = createUI();
      expect(ui.siblingNav).toBeDefined();
      expect(spy.mostRecentCall.args[0]).toBe(toura.components.SiblingNav);
    });

    it("should not create the sibling nav if it is not enabled", function() {
      toura.features.siblingNav = false;
      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent').andCallThrough();

      ui = createUI();

      expect(ui.siblingNav).not.toBeDefined();
      expect(spy).not.toHaveBeenCalled();
    });

    it("should pass the node for the current page to the sibling nav", function() {
      toura.features.siblingNav = true;
      ui = createUI();

      var spy = spyOn(ui.siblingNav, 'set');
      mulberry.app.UI.showPage('foo', 'bar');
      expect(spy).toHaveBeenCalledWith('node', 'bar');
    });

    it("should not show the sibling nav if there are ads", function() {
      var oldConfig = mulberry.app.Config.get('app');

      mulberry.app.Config.set('app', dojo.mixin(oldConfig, { ads : {
        phone : 'phone',
        tablet : 'tablet'
      } }));

      toura.features.siblingNav = true;
      toura.features.ads = true;

      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent').andCallThrough();

      ui = createUI();

      expect(ui.siblingNav).not.toBeDefined();
      expect(spy).not.toHaveBeenCalled();

      mulberry.app.Config.set('app', oldConfig);
    });

    it("should show the sibling nav if there are no ads, even if toura.features.ads is true", function() {
      var oldConfig = mulberry.app.Config.get('app');

      mulberry.app.Config.set('app', dojo.mixin(oldConfig, { ads : {} }));

      toura.features.siblingNav = true;
      toura.features.ads = true;

      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent').andCallThrough();

      ui = createUI();

      expect(ui.siblingNav).toBeDefined();
      expect(spy).toHaveBeenCalled();

      mulberry.app.Config.set('app', oldConfig);
    });
  });

  describe("ad tag", function() {
    beforeEach(function() {
      var oldConfig = mulberry.app.Config.get('app');
      mulberry.app.Config.set('app', dojo.mixin(oldConfig, { ads : {
        phone : 'phone',
        tablet : 'tablet'
      } }));
    });

    it("should create the ad container if it is enabled", function() {
      toura.features.ads = true;
      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent');

      ui = createUI();

      mulberry.app.UI.showPage();
      dojo.publish('/page/transition/end');

      expect(spy.mostRecentCall.args[0]).toBe(toura.components.AdTag);
      expect(mulberry.app.UI.currentPage.hasClass('has-ads')).toBeTruthy();
    });

    it("should not create the ad container if it is not enabled", function() {
      toura.features = {};
      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent');

      ui = createUI();
      expect(spy).not.toHaveBeenCalled();
    });

    it("should pass the device-specific config to the ad component", function() {
      var spy = spyOn(mulberry.app.UI, 'addPersistentComponent'),
          appConfig = mulberry.app.Config.get('app');

      allDevices(function(d) {
        toura.features.ads = true;
        ui = createUI();

        mulberry.app.UI.showPage();
        dojo.publish('/page/transition/end');

        expect(spy.mostRecentCall.args[1].adConfig).toBe(appConfig.ads[d.type]);
      });
    });

    it("should not create the ad container on the home node", function() {
      toura.features.ads = true;
      ui = createUI();

      mulberry.app.UI.currentPage = {
        baseObj : { isHomeNode : true }
      };

      mulberry.app.UI.showPage();
      dojo.publish('/page/transition/end');

      expect(dojo.hasClass(dojo.body(), 'has-ads')).toBeFalsy();
      expect(document.querySelector('.component.ad-tag')).toBeFalsy();
    });

    it("should disable ads when network is unavailable", function(){
      var b = dojo.body();
      toura.features.ads = true;

      mulberry.app.PhoneGap.network.isReachable = function() {
        var dfd = new dojo.Deferred();
        dfd.resolve(true);
        return dfd.promise;
      };

      ui = createUI();
      mulberry.app.UI.showPage();
      dojo.publish('/page/transition/end');

      expect(mulberry.app.UI.currentPage.hasClass('has-ads')).toBeTruthy();

      currentPageClass = [];

      mulberry.app.PhoneGap.network.isReachable = function() {
        var dfd = new dojo.Deferred();
        dfd.resolve(false);
        return dfd.promise;
      };

      ui = createUI();
      mulberry.app.UI.showPage();
      dojo.publish('/page/transition/end');

      expect(mulberry.app.UI.currentPage.hasClass('has-ads')).toBeFalsy();
      expect(document.querySelector('.component.ad-tag')).toBeFalsy();
    });
  });
});
