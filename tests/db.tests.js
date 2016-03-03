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

var testBlogPost = {
  "id": 7,
  "title": "me",
  "author": "me",
  "date": "1",
  "body": "memememe",
  "comments": [],
  "likes": 0
}

test("testing if we can create a blog post", function(t){
  t.plan(4)

  db.createBlogPost(client, 7, testBlogPost, function(error, reply){
    t.ok(! error, "assert no error")
    t.ok(reply, "assert post has been stored")
    client.HGETALL("posts", function(error, reply){
      var expected = JSON.stringify(testBlogPost);
      t.ok(! error, "no error")
      t.equal(expected, reply[7], "checked that the new BlogPost has been stored!")
    })
  })
})

test("test can edit blog post", function(t) {
  var editedPostBody = "fnidubgqoniibcauhfq"
  t.plan(3)
  db.createBlogPost(client, 7, testBlogPost, function(err, __) {
    t.ok(! err, "no error")

    db.editBlogPost(client, 7, 'body', editedPostBody, function(_, __) {
      client.HGET('posts', 7, function(error, reply) {
        t.ok(! error, "no error")
        t.equal(JSON.parse(reply).body, editedPostBody, "Assert has been edited")
      })
    })
  })
})

test("test can add comment", function(t){
  var comment = {
    "author": "tommdfsdf",
    "date": "skdjbfskdjfb",
    "body": "jhsd"
  }
  t.plan(3)
  db.createBlogPost(client, 7, testBlogPost, function(err, __){
    t.ok(! err, "no error")
    db.addComment(client, 7, comment, function(error, reply){
      t.ok(! error, "no error")
      client.HGET("posts", 7, function(error, reply){
        var result = JSON.parse(reply).comments[0]
        var expected = comment
        t.deepEqual(result, expected, "yesss added comment")
      })
    })
  })
})

test("test can like post", function(t) {
  t.plan(4)
  db.createBlogPost(client, 7, testBlogPost, function(err, __) {
    t.ok(!err, "no error")
    db.likePost(client, 7, function(error, _) {
      t.ok(! error, "no error")
      client.HGET('posts', 7, function(error, reply) {
        t.equal(JSON.parse(reply).likes, 1, "likes has gone up")
        db.likePost(client, 7, function(__, _) {
          client.HGET('posts', 7, function(error, reply) {
            t.equal(JSON.parse(reply).likes, 2, "likes has gone up again")
          })
        })
      })
    })
  })
})

test("can get all posts?", function(t){
  t.plan(3)
  db.createBlogPost(client, 7, testBlogPost, function(err, __){
    t.ok(! err, "no errorrr")
    db.getPosts(client, "me", function(error, reply){
      t.ok(! error, "no error" )
      t.deepEqual(testBlogPost, reply[0], "well done you're great :-)")
    })
  })
})

var userObj = {
  "username": "dave",
  "secret": "035729eqdhjnfwr0",
  "email": "0q8efhid"
}

test("can add users to db", function(t) {
  t.plan(2)
  db.addUser(client, userObj.username, userObj, function(error, reply) {
    t.ok(! error, "no error")
    client.HGETALL('users', function(error, reply) {
      t.deepEqual(JSON.parse(reply[userObj.username]), userObj, "user has been added")
    })
  })
})

test("can retrieve userObj", function(t){
  t.plan(2)
  db.addUser(client, userObj.username, userObj, function(error, reply) {
    t.ok(! error, "no error")
    db.getUser(client, 'dave', function(error, reply) {
      t.deepEqual(JSON.parse(reply), userObj, "user has been added")
    })
  })
})

var monkeyPost = {
  "id": 908,
  "title": "monkey post",
  "author": "monkey",
  "date": "12051990",
  "body": "this is a blog post by a monkey",
  "comments": [],
  "likes": 0
}

test('test that a user can edit an existing post', function(t){
  t.plan(3);
  db.createBlogPost(client, 908, monkeyPost, function(err, __) {
    t.ok(!err, "no errors");

  })

  db.getSinglePost(client, 908, function(err, reply) {
    t.ok(!err, "no errors in singlepost method");
    console.log(err);
    console.log(monkeyPost);
    console.log(reply);
    t.deepEqual(reply, monkeyPost, "individual post retrieved from db for editting")
  })
})
