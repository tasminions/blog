const db = require('../db.js')
const util = require('../util.js')

module.exports = function(client) {
  return {
    method:"POST",
    path: "/newpost",
    config: {
      auth: 'simple',
      handler: function(req, reply){
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
      }
    }
  }
}
