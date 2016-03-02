var tape = require('wrapping-tape');
var redis = require('redis');
var db = require('../lib/db.js');
var client, test = {};

var dbUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var dbNum = process.env.REDIS_DB || 16

test = tape({
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

test("testing if we can create a blog post", function(t){
  var newBlogPost = {
    "title": "me",
    "author": "me",
    "date": "1",
    "body": "memememe",
    "comments": [],
    "likes": 0
  }
  t.plan(4)

  db.createBlogPost(client, 7, newBlogPost, function(error, reply){
    t.ok(! error, "assert no error")
    t.ok(reply, "assert post has been stored")
    client.HGETALL("posts", function(error, reply){
      var expected = JSON.stringify(newBlogPost);
      t.ok(! error, "no error")
      t.equal(expected, reply[7], "checked that the new BlogPost has been stored!")
    })
  })
})

test("test can edit blog post", function(t) {
  var blogPost = {
    "title": "me",
    "author": "me",
    "date": "20357",
    "body": "foahew9hqor",
    "comments": [],
    "likes": 0
  }
  var editedPostBody = "fnidubgqoniibcauhfq"
  t.plan(3)
  db.createBlogPost(client, 7, blogPost, function(err, __) {
    t.ok(! err, "no error")

    db.editBlogPost(client, 7, 'body', editedPostBody, function(_, __) {
      client.HGET('posts', 7, function(error, reply) {
        t.ok(! error, "no error")
        t.equal(JSON.parse(reply).body, editedPostBody, "Assert has been edited")
      })
    })
  })
})
