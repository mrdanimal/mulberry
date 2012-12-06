dojo.provide('toura.pages.FeedPage');

dojo.require('mulberry.containers.Page');

dojo.declare('toura.pages.FeedPage', mulberry.containers.Page, {

  pageDef : {
    type: 'node',
    screens: [
      {
        name: 'index',
        backgroundImage: false,
        regions: [{
            className: 'page-nav',
            components: [
              'PageNav'
            ]
          },
          {
            className: 'main-content',
            regions: [{
                className: 'feed-item-list-container',
                backgroundImage: true,
                scrollable: true,
                components: [
                  'ColumnHeaderImage',
                  'FeedItemList'
                ]
              },
              {
                className: 'feed-item-detail-container',
                scrollable: true,
                components: [
                  'FeedItemDetail'
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  postMixInProperties : function() {
    this.inherited(arguments);

    // Create a baseObj here from the feed (or whatever) with the same
    // structure as a Node. Do any event setup that would normally be handled
    // in a Capability here.

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

