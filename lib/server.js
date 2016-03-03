// require env2 to manage environment variables
require('env2')('./config.env');
// require node modules
const Hapi        = require('hapi');
const Joi         = require('joi');
const Inert       = require('inert');
const Basic       = require('hapi-auth-basic');
const Vision      = require('vision');
const Handlebars  = require('handlebars');
const Path        = require('path');
const Bcrypt      = require('Bcrypt');
const Boom        = require('boom')
const redis       = require('redis')
// require local modules
const db          = require('./db.js');

// creating new Server object and setting the port
const server = new Hapi.Server();
server.connection( { port: process.env.PORT || 3000 });

const client = redis.createClient(process.env.REDIS_URL)
client.select(process.env.REDIS_DB || 1, function() {
  console.log('Connected to redis DB');
})

// listing Hapi plugins
const plugins = [
  Inert,
  Basic,
  Vision
];

const validate = function(request, username, password, callback) {
  db.getUser(client, username, function(error, reply) {
    if (error || reply.length > 1) {
      callback(null, false)
    } else {
      Bcrypt.compare(password, reply[0].secret, function(err, isValid) {
        return callback(err, isValid, {name: reply[0].username});
      });
    }
  })
};

server.register( plugins, function( err ){
  server.auth.strategy( 'simple', 'basic', { validateFunc: validate } );
  server.views({
    engines: {
      html: Handlebars
    },
    relativeTo: __dirname + '/../',
    path:       './views',
    layoutPath: './views/layout',
    layout: 'default'
    //partialsPath: '/../views/partials/'
  });

  server.route([
    {
      method: 'GET',
      path:   '/',
      handler: function(req,reply){
        db.getPosts(client, "all", function(err, dbReply){
          return reply.view('index', {posts: dbReply});
        })
      }
    },
    {
      method: 'GET',
      path:   '/adduser',
      handler: function(req,reply){
        userObj = {
          username: req.url.query.username,
          secret: '$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa',
          isAdmin: req.url.query.isAdmin || false,
          email: req.url.query.email || '',
          image: 'http://fillmurray.com/200/200',
          spiel: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
        db.addUser(client, userObj.username, userObj, function(error, __) {
          reply.redirect('/');
        })
      }
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
              username: JSON.parse(profile).username,
              spiel: JSON.parse(profile).spiel,
              image: JSON.parse(profile).image,
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
          db.getPosts(client, req.auth.credentials.name, function(err, stuff){
            var data = {
              username: req.auth.credentials.name,
              posts: []
            }
            data.posts = stuff.map(function(post){
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
          var blogPost = {
            "id": Date.now(),
            "title": req.payload.posttitle,
            "author": req.auth.credentials.name,
            "body": req.payload.postbody,
            "comments": [],
            "likes": 0
          }
          db.createBlogPost(client, blogPost.id, blogPost, function(err, __){
            if (err) {
              return reply("DB error")
            }
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
          if(! err){
            reply({success: true})
          }
          else {
            reply({success: false})
          }
        })
      }
    },
    {
      method:"GET",
      path: "/editpost/{id}",
      handler: function(req, reply){

        db.getSinglePost(client, req.params.id, function(err, answer){
          if (err) {
            return reply("DB error")
          }
          reply.view('editpost', answer)
        });
      }
    },
    {
      method:'POST',
      path:'/savepost',
      handler: function(req,reply){
        console.log(req.payload);
      }
    },
    {
        method: "POST",
        path: "/comment",
        handler: function(req, reply){
          var comment = {
            author: req.url.query.author || 'anonymous',
            date: Date.now(),
            body: req.url.query.body
          }
          db.addComment(client, req.url.query.id, comment, function(err, dbReply){
            if(! err){
              reply({success: true})
            }
            else {
              reply({success: false})
            }
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
