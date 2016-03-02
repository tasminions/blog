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
// require local modules
const DB          = require('./db.js');

// creating new Server object and setting the port
const server = new Hapi.Server();
server.connection( { port: process.env.PORT || 3000 });

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

// var userDB = DB.getUser;

const validate = function(request, username, password, callback){
  const user = userDB[username]
  if( !user ){ callback(null,false) }
  else{
    Bcrypt.compare( password, user.password, function(err,isValid){
      return callback(err, isValid, {id:user.id, name:user.name});
    });
  }
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
          console.log(req.auth.credentials);
          return reply.view('dashboard');
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
    }
  ]);

  server.start(function(err){
    if(err){ throw err; }
    console.log('Server has started and is listening on ',server.info.uri);
  });

});
module.exports = server;
