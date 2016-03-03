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

var userDB = {
  admin:{
    username:'admin',
    password:'$2a$04$nIWs.FC0GBdUQJJBFKvxUeQUPpuF41EZKndhv912TFmUgD4MMQQRe', // type 'password'
    name: 'administrator',
    id:1
  }
}

const validate = function(request, username, password, callback) {
  db.getUser(client, username, function(error, reply) {
    if (error) {
      callback(null, false)
    } else {
      Bcrypt.compare(password, JSON.parse(reply).secret, function(err, isValid) {
        return callback(err, isValid, {name: reply.username});
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

  //Handlebars.registerPartial('home', '{{post}}');

  server.route([
    {
      method: 'GET',
      path:   '/',
      handler: function(req,reply){
        return reply.view('index');
      }
    },
    {
      method: 'GET',
      path:   '/adduser',
      handler: function(req,reply){
        userObj = {
          username: 'admin',
          secret: '$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa',
          isAdmin: true,
          email: ''
        }
        db.addUser(client, userObj.username, userObj, function(error, __) {
          reply.redirect('login');
        })
      }
    },
    {
      method: 'GET',
      path:   '/login',
      handler: function(req,reply){
        reply.view('login');
      }
    },
    {
      method: 'GET',
      path:   '/public/{param*}',
      handler: {
        directory: {
          path:Path.join(__dirname,'/../public/')
        }
      }
    },
    {
      method: 'GET',
      path:   '/about',
      handler: function(req, reply) {
        return reply.view('about');
      }
    },
    {
      method: 'GET',
      path:   '/dashboard',
      config: {
        auth: 'simple',
        handler: function(req, reply) {
          db.getPosts(client, "sally", function(err, stuff){
            var data = {
              username: "sally",
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
      method: 'POST',
      path:   '/auth',
      config: {
        auth: 'simple',
        handler: function(req, reply) {
          console.log(req.url);
          reply.redirect('/dashboard');
        }
      }
    },
    {
      method:"POST",
      path: "/newpost",
      handler: function(req, reply){
        var blogPost = {
          "id": Date.now(),
          "title": req.payload.posttitle,
          "author": "sally",
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
    },
    {
      method:"GET",
      path: "/editpost/{id}",
      handler: function(req, reply){
        console.log(req.url);

        db.getSinglePost(client, req.params.id, function(err, answer){
          if (err) {
            return reply("DB error")
          }
          console.log(answer.title);
          reply.view('editpost', answer)
        })

      }
    }
  ]);
})


server.start(function(err){
  if(err){ throw err; }
  console.log('Server has started and is listening on ',server.info.uri);
});


module.exports = server
