dojo.provide('toura.pages.FeedPage');

dojo.require('mulberry.containers.Page');

dojo.declare('toura.pages.FeedPage', mulberry.containers.Page, {

  pageDef : {
    type: 'node',
    capabilities: [
      'FeedItemList_FeedItemDetail'
    ],
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
    //
    console.log('this.baseObj.feeds[0]', this.baseObj.feeds[0]);
  }
});

