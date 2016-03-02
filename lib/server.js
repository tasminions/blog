require('env2')('./config.env');

const Hapi = require('hapi');
const Joi = require('joi');
const Inert = require('inert');
const Basic = require('hapi-auth-basic');
const Vision = require('vision');
const Handlebars = require('handlebars');
const Path = require('path');


const server = new Hapi.Server();
server.connection( { port: process.env.PORT || 3000 });


console.log(__dirname + '/../');

const plugins = [
  Inert,
  Basic,
  Vision
];
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
        //const fileURL = Path.join(__dirname + '/../views/index.html');
        //console.log( fileURL );
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
        return reply.view('dashboard');
      }
    },
    {
      method: 'POST',
      path:   '/auth',
      handler: function(req, reply) {
        console.log(req);
      }
    }
  ]);

  server.start(function(err){
    if(err){ throw err; }
    console.log('Server has started and is listening on ',server.info.uri);
  });

});
module.exports = server;
