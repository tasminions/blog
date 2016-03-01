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

const plugins = [
  Inert,
  Basic,
  Vision
];
server.register( plugins, function( err ){
  server.views({
    engines:    {html: Handlebars},
    relativeTo: __dirname,
    path:       '../views'
  });

  server.route([
    {
      method: 'GET',
      path:   '/',
      handler: function(req,reply){
        const fileURL = Path.join(__dirname+'/../views/index.html');
        console.log( fileURL );
        reply.file( fileURL );
      }
    }
  ]);

  server.start(function(err){
    if(err){ throw err; }
    console.log('Server has started and is listening on ',server.info.uri);
  });

});
