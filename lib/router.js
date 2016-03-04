module.exports = function(client) {

  var handlers = require('./handlers.js')(client)

  return [
    {
      method: 'GET',
      path:   '/',
      handler: handlers.index
    },
    {
      method: 'GET',
      path:   '/adduser',
      handler: handlers.adduser
    },
    {
      method: 'GET',
      path:   '/public/{param*}',
      handler: handlers.resources
    },
    {
      method: 'GET',
      path:   '/about',
      handler: handlers.about
    },
    {
      method: 'GET',
      path:   '/dashboard',
      config: {
        auth: 'simple',
        handler: handlers.dashboard
      }
    },
    {
      method:"POST",
      path: "/newpost",
      config: {
        auth: 'simple',
        handler: handlers.newpost
      }
    },
    {
      method: "POST",
      path: "/like",
      handler: handlers.like
    },
    {
      method:"GET",
      path: "/editpost/{id}",
      config: {
        auth: 'simple',
        handler: handlers.editpost
      }
    },
    {
      method:'POST',
      path:'/savepost/{id}',
      config: {
        auth: 'simple',
        handler: handlers.savepost
      }
    },
    {
      method: "POST",
      path: "/comment",
      handler: handlers.comment
    }
  ]
}
