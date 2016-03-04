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
const routes      = require('./router.js')

// listing Hapi plugins
const plugins = [
  'inert',
  'hapi-auth-basic',
  'vision'
].map(name => require(name));

const server = new Hapi.Server();
server.connection( { port: PORT });

const client = redis.createClient(DB_URL)
client.select(DB_NUM, function() {
  console.log('Connected to redis DB');
})

server.register( plugins, function( err ){
  server.auth.strategy( 'simple', 'basic', {validateFunc: auth(client)} );
  server.views({
    engines: {html: Handlebars},
    relativeTo: __dirname + '/../',
    path:       './views',
    layoutPath: './views/layout',
    layout: 'default',
    partialsPath: './views/partials/'
  });

  server.route(routes(client));

})


server.start(function(err){
  if(err){ throw err; }
  console.log('Server has started and is listening on ', server.info.uri);
});


module.exports = {
  obj: server,
  client: client
};
