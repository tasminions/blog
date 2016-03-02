require('env2')('./config.env');

const Hapi = require('hapi');
const Joi = require('joi');
const Inert = require('inert');
const Basic = require('hapi-auth-basic');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Path = require('path');
const db = require('./db.js')
const Boom = require('boom')
const redis = require('redis')

const server = new Hapi.Server();
server.connection( { port: process.env.PORT || 3000 });

const client = redis.createClient(process.env.REDIS_URL)
client.select(process.env.REDIS_DB || 0, function() {
  console.log('Connected to redis DB');
})

const plugins = [
  Inert,
  Basic,
  Vision
];

var userDB = {
  admin:{
    username:'admin',
    password:'password',
    name: 'administrator',
    id:1
  }
}

server.register( plugins, function( err ){
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
      path:   '/login',
      handler: function(req,reply){
        return reply.view('login');
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
    },
    {
      method: 'POST',
      path:   '/auth',
      handler: function(req, reply) {
        reply('you are the admin');
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
    }
  ]);
})


server.start(function(err){
  if(err){ throw err; }
  console.log('Server has started and is listening on ',server.info.uri);
});


module.exports = server
