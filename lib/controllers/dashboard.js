const db = require('../db.js')

module.exports = function(client) {
  return {
    method: 'GET',
    path:   '/dashboard',
    config: {
      auth: 'simple',
      handler: function(req, reply) {
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
      }
    }
  }
}
