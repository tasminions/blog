// require env2 to manage environment variables
require('env2')('./config.env')

// Environment variables
PORT = process.env.PORT || 3000
DB_URL = process.env.REDIS_URL || 'redis://localhost:6379'
DB_NUM = process.env.REDIS_DB || 1

// require node modules
const Hapi        = require('hapi')
const Handlebars  = require('handlebars')
const Path        = require('path')
const Bcrypt      = require('bcrypt')
const Boom        = require('boom')
const redis       = require('redis')

// require local modules
const db          = require('./db.js')
const util        = require('./util.js')
const auth        = require('./auth.js')
const handlers    = require('./handlers.js')

// listing Hapi plugins
const plugins = [
  'inert',
  'hapi-auth-basic',
  'vision'
].map(name => require(name));

// creating new Server object and setting the port
const server = new Hapi.Server();
server.connection( { port: PORT });

const client = redis.createClient(DB_URL)
client.select(DB_NUM, function() {
  console.log('Connected to redis DB');
})

server.register( plugins, function( err ){
  server.auth.strategy( 'simple', 'basic', {validateFunc: auth.validate} );
  server.views({
    engines: {html: Handlebars},
    relativeTo: __dirname + '/../',
    path:       './views',
    layoutPath: './views/layout',
    layout: 'default',
    partialsPath: './views/partials/'
  });

  server.route([
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
      handler: {
        directory: {
          path: Path.join(__dirname,'/../public/')
        }
      }
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
      method: "POST",
      path: "/like",
      handler: function(req, reply){
        db.likePost(client, req.url.query.id, function(err, dbReply){
          reply(!err)
        })
      }
    },
    {
      method:"GET",
      path: "/editpost/{id}",
      config: {
        auth: 'simple',
        handler: function(req, reply){
          db.getSinglePost(client, req.params.id, function(err, answer){
            if (err) {
              return reply("DB error")
            }
            reply.view('editpost', answer)
          });
        }
      }
    },
    {
      method:'POST',
      path:'/savepost/{id}',
      config: {
        auth: 'simple',
        handler: function(req,reply){
          db.editBlogPost(client, Number(req.params.id), req.payload, function(err, dbReply){
            if(err){
              return reply("DB error");
            }
            reply.redirect('/dashboard');
          });
        }
      }
    },
    {
      method: "POST",
      path: "/comment",
      handler: function(req, reply){
        var comment = {
          author: req.url.query.author || 'anonymous',
          date: util.getDateString(Date.now()),
          body: req.url.query.body
        }
        db.addComment(client, req.url.query.id, comment, function(err, dbReply){
          reply({success: (!err)})
        })
      }
    }
  ]);
})


server.start(function(err){
  if(err){ throw err; }
  console.log('Server has started and is listening on ',server.info.uri);
});


module.exports = server;
