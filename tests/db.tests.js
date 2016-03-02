var tape = require('wrapping-tape');
var redis = require('redis');
var db = require('../lib/db.js');
var client, test = {};

var dbUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var dbNum = process.env.REDIS_DB || 16

test.module1 = tape({
  setup: function(t){
    client = redis.createClient(dbUrl)
    client.select(dbNum, function(){
      console.log("connected to database number " + dbNum)
    })
    t.end()
  },
  teardown: function(t){
    client.flushdb()
    client.end()
    t.end()
  }
})

test.module1("testing if we can create a blog post", function(t){
  var newBlogPost = {
    "title": "me",
    "author": "me",
    "date": "1",
    "body": "memememe",
    "comments": [],
    "likes": 0
  }
  db.createBlogPost(client, newBlogPost, function(error, reply){
    t.ok(! error, "assert no error")
    t.ok(reply, "assert post has been stored")
  })
})
