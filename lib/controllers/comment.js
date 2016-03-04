const db = require('../db.js')
const util = require('../util.js')

module.exports = function(client) {
  return {
    method: "POST",
    path: "/comment",
    handler: function(req, reply){
      var comment = {
        author: req.url.query.author || 'anonymous',
        date: util.getDateString(Date.now()),
        body: req.url.query.body
      }
      db.addComment(client, req.url.query.id, comment, (err, dbReply) => reply({success: (!err)}))
    }
  }
}
