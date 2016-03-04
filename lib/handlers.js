const db = require('./db.js')
const util = require('./util.js')
const Path = require('path')

module.exports = function(client) {
  return {
    index: function(req,reply){
      db.getPosts(client, "all", function(err, dbReply){
        return reply.view('index', {posts: dbReply});
      })
    },

    resources: {
      directory: {
        path: Path.join(__dirname,'/../public/')
      }
    },

    about: function(req, reply) {
      db.getUser(client, "all", function(err, dbReply){
        var profileArray = dbReply.map(function(profile){
          return {
            username: profile.username,
            spiel: profile.spiel,
            image: profile.image,
          }
        })
        return reply.view('about', {users: profileArray});
      })
    },

    dashboard: function(req, reply) {
      db.getPosts(client, req.auth.credentials.name, function(err, dbReply){
        var data = {
          username: req.auth.credentials.name,
          posts: []
        }
        data.posts = dbReply.map(function(post){
          var obj = {};
          obj.id = post.id
          obj.title = post.title
          return obj
        })
        return reply.view('dashboard', data);
      })
    },

    newpost: function(req, reply){
      var now = Date.now()
      var blogPost = {
        "id": now,
        "title": req.payload.title,
        "author": req.auth.credentials.name,
        "date": util.getDateString(now),
        "body": req.payload.body,
        "comments": [],
        "likes": 0
      }
      db.createBlogPost(client, blogPost.id, blogPost, function(err, __){
        if (err) return reply("DB error")
        reply.redirect('/dashboard')
      })
    },

    savepost: function(req,reply){
      db.editBlogPost(client, Number(req.params.id), req.payload, function(err, dbReply) {
        if(err) return reply("DB error")
        reply.redirect('/dashboard')
      });
    },

    editpost: function(req, reply) {
      db.getSinglePost(client, req.params.id, function(err, answer) {
        if (err) return reply("DB error")
        reply.view('editpost', answer)
      });
    },

    comment: function(req, reply){
      var comment = {
        author: req.url.query.author || 'anonymous',
        date: util.getDateString(Date.now()),
        body: req.url.query.body
      }
      db.addComment(client, req.url.query.id, comment, (err, dbReply) => reply({success: (!err)}))
    },

    like: function(req, reply){
      db.likePost(client, req.url.query.id, (err, dbReply) => reply({success: !err}))
    },

    adduser: function(req,reply){
      userObj = {
        username: req.url.query.username,
        secret: '$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa',
        isAdmin: req.url.query.isAdmin || false,
        email: req.url.query.email || '',
        image: req.url.query.img || 'http://2.bp.blogspot.com/-uqnxuaf04gg/UGQh4fNFv2I/AAAAAAAAAvk/oEGcBIytgv0/s1600/05-orango.jpg',
        spiel: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      }
      db.addUser(client, userObj.username, userObj, function(error, __) {
        reply.redirect('/');
      })
    },

  }
}
