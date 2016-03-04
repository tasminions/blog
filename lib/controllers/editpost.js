const db = require('../db.js')

module.exports = function(client) {
  return {
    method:"GET",
    path: "/editpost/{id}",
    config: {
      auth: 'simple',
      handler: function(req, reply) {
        db.getSinglePost(client, req.params.id, function(err, answer) {
          if (err) return reply("DB error")
          reply.view('editpost', answer)
        });
      }
    }
  }
}
