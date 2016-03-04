const db = require('../db.js')

module.exports = function(client) {
  return {
    method: "POST",
    path: "/like",
    handler: function(req, reply){
      db.likePost(client, req.url.query.id, (err, dbReply) => reply({success: !err}))
    }
  }
}
