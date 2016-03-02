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
        //const fileURL = Path.join(__dirname + '/../views/index.html');
        //console.log( fileURL );
        return reply.view('login');
      }
    },
    {
      method: 'GET',
      path:   '/public/css/main.css',
      handler: function(request, reply){
        console.log(request.url);
        var path = Path.join(__dirname, "../public/css/main.css");
        reply.file(path);
      }
    }

  ]);

  server.start(function(err){
    if(err){ throw err; }
    console.log('Server has started and is listening on ',server.info.uri);
  });

});
