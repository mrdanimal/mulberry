dojo.provide('toura.pages.FeedPage');

dojo.require('mulberry.containers.Page');

dojo.declare('toura.pages.FeedPage', mulberry.containers.Page, {

  constructor : function() {
    this.inherited(arguments);
    console.log('constructor!!!');
  },

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
          }
        ]
      }
    ]
  },

  prepareData : function() {
    console.log('arguments', arguments);

  }
});

