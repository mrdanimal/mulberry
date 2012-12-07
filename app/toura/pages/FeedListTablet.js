dojo.provide('toura.pages.FeedListTablet');

dojo.require('mulberry.containers.Page');
dojo.require('dojo.cache');

dojo.declare('toura.pages.FeedListTablet', mulberry.containers.Page, {

  pageDef : dojo.fromJson(dojo.cache('toura.pages', 'FeedListTablet/feed-list-tablet.json')),

  postMixInProperties : function() {
    this.inherited(arguments);

    // Create a baseObj here from the feed (or whatever) with the same
    // structure as a Node.

    console.log('this.baseObj.feeds[0]', this.baseObj.feeds[0]);
  },

  postCreate : function() {
    this.inherited(arguments);
    var screen = this.getScreen('index'),
        feedItemList = screen.getComponent('FeedItemList'),
        feedItemDetail = screen.getComponent('FeedItemDetail');

    this.connect(feedItemList, 'onPopulate', function() {
      feedItemDetail.set('item', feedItemList.feed.getItem(0));
    });

    this.connect(feedItemList, 'onSelect', function(feedId, itemIndex) {
      feedItemDetail.set('item', feedItemList.feed.getItem(itemIndex));
    });
  }
});

