var db = require('./db.js')

module.exports = {
  index: function(req,reply){
    db.getPosts(client, "all", function(err, dbReply){
      return reply.view('index', {posts: dbReply});
    })
  },
  resources: function() {

  },
  about: function() {

  },
  dashboard: function() {

  },
  newpost: function() {

  },
  savepost: function() {

  },
  editpost: function() {

  },
  comment: function() {

  },
  like: function() {

  },
  adduser: function(req,reply){
    userObj = {
      username: req.url.query.username,
      secret: '$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa',
      isAdmin: req.url.query.isAdmin || false,
      email: req.url.query.email || '',
      image: 'http://fillmurray.com/200/200',
      spiel: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
    db.addUser(client, userObj.username, userObj, function(error, __) {
      reply.redirect('/');
    })
  },
}
