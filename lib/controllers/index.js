var db = require('../db.js')

module.exports = function(client){
  return {
    method: 'GET',
    path:   '/',
    handler: function(req,reply){
      db.getPosts(client, "all", function(err, dbReply){
        return reply.view('index', {posts: dbReply});
      })
    }
  }

}
