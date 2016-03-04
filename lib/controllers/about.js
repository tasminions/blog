const db = require('../db.js')

module.exports = function(client) {
  return {
    method: 'GET',
    path:   '/about',
    handler: function(req, reply) {
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
    }
  }
}
