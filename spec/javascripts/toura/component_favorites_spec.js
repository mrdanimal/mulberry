describe("toura.components.Favorites", function() {
  var c, t, data, ds, node, favs, id = 'node-videos';

  function C(config) {
    if (c) { c.destroy(); }
    return new toura.components.Favorites(config).placeAt(t);
  }

  beforeEach(function() {
    dojo.require('toura.components.Favorites');
    dojo.require('toura.User');

    if (!ds) {
      ds = mulberry.app.DeviceStorage;
      ds.init(mulberry.app.Config.get('id'));
    }

    ds.set('favorites', null);

    favs = toura.User.getFavorites();

    favs.empty();

    node = dataAPI.getModel(id);

    t = document.getElementById('test');

    if (c) { c.destroy(); }

    mulberry.app.UI.hasTouch = true;
  });

  it("should generate the component", function() {
    allDevices(function(d) {
      var deleteBtn, click;
          c = C({
            device : d,
            node : { favorites : [] }
          });

      expect(c).toBeDefined();
      expect(c.domNode).toBeDefined();
      expect(c.favorites).toBeDefined();
      expect(c.favoritesList).toBeDefined();
      expect(t.querySelector(getRootSelector(c))).toBeTruthy();
    });
  });

  it("should list favorites", function() {
    allDevices(function(d) {
      var f, num;

      favs.addFavorite(node);
      f = favs.load();
      num = f.length;

      c = C({
        device : d,
        node : { favorites : f }
      });

      expect(c.favorites.length).toEqual(num);
      expect(c.favoritesList.childNodes.length).toEqual(num);
    });
  });

  it("should display a message if there are no favorites listed", function() {
    allDevices(function(d) {
      c = C({
        device : d,
        node : { favorites : [] }
      });

      expect(c.favoritesList.childNodes.length).toEqual(1);
      expect(c.favoritesList.childNodes[0].innerText).toEqual(c.i18n_noFavorites);
    });
  });

  it("should allow you to delete favorites", function() {
    allDevices(function(d) {
      var spy = jasmine.createSpy(),
          f, num, click, deleteBtn;

      dojo.subscribe('/favorite/remove', spy);
      favs.addFavorite(node);

      f = favs.load();
      num = f.length;

      c = C({
        device : d,
        node : { favorites : f }
      });

      dojo.filter(c._supportingWidgets, function(widget){
        if (widget.isInstanceOf(toura.components.buttons.DeleteButton)) {
          deleteBtn = widget;
        }
      });

      deleteBtn.deleting = true;
      click = getEventHandler(deleteBtn, 'touchstart', deleteBtn.domNode);
      click(fakeEventObj);

      expect(spy).toHaveBeenCalledWith(deleteBtn.objId);
      expect(c.favoritesList.childNodes.length).toEqual(num -1);
    });
  });

});
