dojo.provide('toura.pages.FeedPage');

dojo.require('mulberry.containers.Page');

dojo.declare('toura.pages.FeedPage', mulberry.containers.Page, {

  pageDef : {
    "type": "node",
    "screens": [
      {
        "name": "index",
        "backgroundImage": true,
        "regions": [
          {
            "className": "page-nav",
            "components": [
              "PageNav"
            ]
          },
          {
            "scrollable": true,
            "components": [
              "PageHeaderImage",
              "FeedItemList"
            ]
          }
        ]
      }
    ]
  },

  postMixInProperties : function() {
    this.inherited(arguments);
    console.log('this.baseObj.feeds[0]', this.baseObj.feeds[0]);
  }
});

