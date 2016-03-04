const db = require('../db.js')

module.exports = function(client) {
  return {
    method:'POST',
    path:'/savepost/{id}',
    config: {
      auth: 'simple',
      handler: function(req,reply){
        db.editBlogPost(client, Number(req.params.id), req.payload, function(err, dbReply) {
          if(err) return reply("DB error")
          reply.redirect('/dashboard')
        });
      }
    }
  }
}
