dojo.provide('toura.user.Favorites');

dojo.require('dojo.store.Memory');
dojo.require('mulberry.app.DeviceStorage');
dojo.require('toura.Data');
dojo.require('toura.models.Favorite');

(function(){

var ds = mulberry.app.DeviceStorage;

dojo.declare('toura.user.Favorites', null, {
  constructor : function() {
    this._init();

    this.subscriptions = [
      dojo.subscribe('/data/loaded', this, '_refresh')
    ];
  },

  _init : function() {
    var favs = ds.get('favorites');
    this.store = new dojo.store.Memory({
      data : favs || []
    });

    this._refresh();
  },

  _refresh : function() {
    dojo.forEach(this.store.data, function(item) {
      if (!toura.Data.getById(item.id)) {
        item.deleted = true;
        this.store.put(item);
      }
    }, this);

    this.onRefresh(this.store.data);
  },

  _save : function(whatToSave) {
    console.log('will try to save', this.store.data);
    ds.set('favorites', whatToSave || this.store.data);
  },

  _sort : function(prop, descending) {
    if (!prop) {
      throw new Error('toura.user.Favorites::_sort requires a property for sorting');
    }

    var data = [].concat(this.store.data),
        sortedData = this._makeModels(
          data[0] && data[0][prop] ? data.sort(function(a, b) {
            a = a[prop];
            b = b[prop];

            if (a < b) { return descending ? 1 : -1; }
            if (a > b) { return descending ? -1 : 1; }

            return 0;
          }) : data
        );
    return sortedData;
  },

  _makeModels : function(data) {
    return dojo.map(data, function(item) {
      return dojo.mixin({
        model : toura.Data.getModel(item.id)
      }, item);
    }, this);
  },

  onRefresh : function(data) {
    // stub
  },

  load : function(sortProp, sortDescending) {
    if (!sortProp) {
      sortProp = 'added';
      sortDescending = true;
    }
    return this._sort(sortProp || 'added', sortDescending);
  },

  isFavorite : function(obj) {
    return !!obj && !!obj.id && !!this.store.get(obj.id);
  },

  addFavorite : function(obj) {
    console.log('toura.user.Favorites::addFavorite()', obj);
    if (this.isFavorite(obj)) { return; }

    this.store.add(new toura.models.Favorite(obj));
    this._save();
    dojo.publish('/favorite/add', [ obj.url ]);
  },

  removeFavorite : function(obj) {
    console.log('toura.user.Favorites::removeFavorite()', obj);
    // allow passing in object or object id
    var id = dojo.isString(obj) ? obj : obj.id;

    this.store.remove(id);
    this._save();
    dojo.publish('/favorite/remove', [ obj.url ]);
  },

  hasFavorites : function() {
    return !!this.store.data.length;
  },

  empty : function() {
    this._save([]);
    this._init();
  },

  destroy : function() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }
});

}());

