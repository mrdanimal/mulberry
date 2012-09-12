dojo.provide('toura.User');

dojo.require('toura.user.Favorites');

toura.User = (function(){
  var user = {};
  user._favorites = null;

  user.getFavorites = function() {
    user._favorites = user._favorites || new toura.user.Favorites();
    return user._favorites;
  };

  return user;

})();

