dojo.provide('toura.components.MoreDrawer');

dojo.require('mulberry._Component');
dojo.require('mulberry.app.PhoneGap');
dojo.require('toura.Sharing');
dojo.require('toura.User');
dojo.require('toura.components.buttons.HomeButton');
dojo.require('toura.components.buttons.SearchButton');
dojo.require('toura.components.buttons.FontSize');
dojo.require('toura.components.SocialMessage');

dojo.declare('toura.components.MoreDrawer', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'MoreDrawer/MoreDrawer.haml'),

  helpers : {
    sharingButtons : dojo.cache('toura.components', 'MoreDrawer/_SharingButtons.haml'),
    favoriteButton : dojo.cache('toura.components', 'MoreDrawer/_FavoriteButton.haml'),
    homeButton : dojo.cache('toura.components', 'MoreDrawer/_HomeButton.haml'),
    fontSizeButton : dojo.cache('toura.components', 'MoreDrawer/_FontSizeButton.haml'),
    searchButton : dojo.cache('toura.components', 'MoreDrawer/_SearchButton.haml')
  },

  widgetsInTemplate : true,

  isHidden : true,

  prepareData : function() {
    this.sharingDisabled = !toura.features.sharing;
    this.favoritesDisabled = !toura.features.favorites;
    this.fontSizeDisabled = !toura.features.fontSize;

    if (!this.sharingDisabled) {
      this.socialMediaServices = toura.Sharing.getServices();

      if (!this.socialMediaServices.length) {
        this.sharingDisabled = true;
      }
    }

    this.helpers.sharingButtons = this.sharingDisabled ? '' : this.helpers.sharingButtons;
    this.helpers.favoriteButton = this.favoritesDisabled ? '' : this.helpers.favoriteButton;
    this.helpers.fontSizeButton = this.fontSizeDisabled ? '' : this.helpers.fontSizeButton;
    this.inherited(arguments);
  },

  setupConnections : function() {
    var touch = mulberry.app.UI.hasTouch,
        evt = touch ? 'touchstart' : 'click',
        prevent = function(e) { e.preventDefault(); };

    if (!this.sharingDisabled) {
      dojo.forEach(this.socialMediaServices, function(service) {
        var socialButton = this[service.name];
        if (!socialButton) { return; }
        this.connect(socialButton, evt, dojo.hitch(this, '_handleSocialMessageClick', service));
        if (touch) { this.connect(socialButton, 'click', prevent); }
      }, this);
      this.hide(this.shareSection);
    }

    if (!this.favoritesDisabled) {
      // set up favorite button
      this.connect(this.favorite, evt, '_handleFavorite');

      if (touch) {
        this.connect(this.favorite, 'click', prevent);
      }
    }
  },

  adjustMarkup : function() {
    if (this.sharingDisabled) { return; }

    dojo.forEach(['facebook', 'twitter'], function(svcName) {
      var enabled = dojo.filter(this.socialMediaServices, function(svc) {
        return svc.name === svcName;
      });

      if (!enabled.length) {
        dojo.destroy(this.query('.' + svcName)[0]);
      }
    }, this);
  },

  _createMailLink : function() {

    if (!this.email) { return; }
    dojo.attr(this.email, 'href', 'mailto:?' + dojo.objectToQuery({
      subject : mulberry.app.Config.get('app').name,
      body : toura.Sharing.getMessage('email', this.node)
    }));

    this.connect(this.email, 'click', function() {
      dojo.publish('/share', [
        [ 'email', this.node.id ].join(': ')
      ]);
    });
  },

  _handleSocialMessageClick : function(service) {
    console.log('toura.components.MoreDrawer::_handleSocialMessageClick()');

    mulberry.app.PhoneGap.network.isReachable().then(dojo.hitch(this, function(isReachable) {
      if (!isReachable) {
        mulberry.app.PhoneGap.notification.alert(this.i18n_noNetwork);
        return;
      }

      if (this.socialMessage) {
        var same = this.socialMessage.name === service.name;

        this.orphan(this.socialMessage, true);
        delete this.socialMessage;

        if (same) {
          dojo.removeClass(this[service.name], 'active');
          return;
        }
      }

      // mark which button was clicked
      dojo.addClass(this[service.name], 'active');

      var params = dojo.mixin({
            messageText : toura.Sharing.getMessage(service.name, this.node)
          }, service),

          socialMessage = this.socialMessage =
          this.adopt(toura.components.SocialMessage, params);

      socialMessage.placeAt(this.shareSection);
      this.show(this.shareSection);

      this.connect(socialMessage, 'onSubmit', function(params) {
        toura.Sharing.share(service, params, this.node)
          .then(
            // sharing was successful
            dojo.hitch(this, function() {
              this.hide(this.shareSection);
            }),
            // sharing failed
            function(msg) {
              // TODO: i18n
              if (msg) { mulberry.app.PhoneGap.notification.alert(msg); }
            }
          );
      });

      this.connect(socialMessage, 'onCancel', function() {
        this.hide(this.shareSection);
        this.orphan(socialMessage, true);
        delete this.socialMessage;
      });
    }), function() {
      mulberry.app.PhoneGap.notification.alert(this.i18n_noNetwork);
    });
  },

  _handleFavorite : function(e) {
    console.log('toura.components.MoreDrawer::_handleFavorite');

    if (!this.node) { return; }

    var n = this.node,
        api = toura.User.getFavorites(),
        isFav = api.isFavorite(n),
        action = isFav ? 'removeFavorite' : 'addFavorite';

    api[action](n);
    this.favorite.checked = !isFav;
  },

  _setNodeAttr : function(node) {
    this.node = node;
    if (this.favorite) {
      this.favorite.checked = toura.User.getFavorites().isFavorite(node);
    }

    this._createMailLink();
  },

  toggle : function() {
    if (!this.isHidden) {
      dojo.publish('/MoreDrawer/hide');
      this.hide(this.shareSection);
    } else {
      dojo.publish('/MoreDrawer/show');
    }

    this.inherited(arguments);
  },

  initializeStrings : function() {
    this.i18n_noNetwork = this.getString('NO_NETWORK');
  }

});
