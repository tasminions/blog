const Bcrypt = require('bcrypt')
const db = require('./db.js')

module.exports = function(client) {
  return function(request, username, password, callback) {
    db.getUser(client, username, function(error, reply) {
      if (error || reply.length > 1) {
        callback(null, false)
      } else {
        Bcrypt.compare(password, reply[0].secret, function(err, isValid) {
          return callback(err, isValid, {name: reply[0].username});
        });
      }
    })
  }
}
