const tape    = require('wrapping-tape');
const server  = require('./../lib/server.js');

tape.module1 = tape({
  startup: function(t){
    server.start(function(err){
      console.log('server has started and is listening on ',server.info.uri);
      console.log('TESTING SERVER AND ROUTING BEHAVIOUR');
    });
  },
  teardown: function(t){
    t.end();
    server.stop();
  }
});

tape.module1( 'Testing "/" route', function(t){

  const indexOptions = {
    method:'GET',
    url:'/'
  };
  server.inject( indexOptions, function(res){
    t.plan(4);
    t.equal( res.statusCode, 200,'/ request results in a 200 status Code');
    t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/" route results in an html being sent back');
    t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/" route sends back the default html template (which has a navbar)');
    t.ok( res.result.indexOf('<!-- this is the index view -->') > -1 ,'"/" route sends back the index html view');
  });
});

tape.module1( 'Testing "/login" route', function(t){
  const loginOptions = {
    method:'GET',
    url:'/login'
  };
  server.inject( loginOptions, function(res){
    t.plan(4);
    t.equal( res.statusCode, 200,'login request results in a 200 status Code');
    t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/login" route results in an html being sent back');
    t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/login" route fetches default html template (which has a navbar)');
    t.ok( res.result.indexOf('<!-- this is the login view -->') > -1 ,'"/login" route sends back the login html view');
  });
});

tape.module1( 'Testing the serving of static files', function(t){
  const staticOptions = {
    method:'GET',
    url:'/public/css/main.css'
  };
  server.inject( staticOptions, function(res){
    t.plan(2);
    t.equal( res.statusCode, 200,'css request results in a 200 status Code');
    t.equal( res.headers['content-type'], 'text/css; charset=utf-8', 'css request sends back a file with css content-type.');
  });
});

tape.module1( 'Testing /about route', function(t){
  const aboutOptions = {
    method:'GET',
    url:'/about'
  };
  server.inject( aboutOptions, function(res){
    t.plan(4);
    t.equal( res.statusCode, 200,'about request results in a 200 status Code');
    t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/about" route results in an html being sent back');
    t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/about" route fetches default html template (which has a navbar)');
    t.ok( res.result.indexOf('<!-- this is the about view -->') > -1 ,'"/login" route sends back the about html view');
  });
});

tape.module1( 'Testing /auth route with params', function(t){
  const authGood = {username:'adminTest',password:'password'};
  const authOptionsGood = {
    method:'POST',
    url:'/auth',
    headers: authGood
  };
  t.plan(4);
  server.inject( authOptionsGood, function(res){
    t.equal( res.statusCode, 200,'about request with correct password results in a 200 status Code');
    t.equal( res.result, 'you are the admin', 'user has authenticated correcly (this test will need to be changed later on)!');
  });

  const authBad = {username:'impostor',password:'blah'};
  const authOptionsBad = {
    method:'POST',
    url:'/auth',
    headers: authBad
  };
  server.inject( authOptionsBad, function(res){
    t.equal( res.statusCode, 404,'about request with wrong password results in a 404 status Code');
    t.notEqual( res.result, 'you are the admin', 'user has authenticated correcly (this test will need to be changed later on)!');
  });
});

tape.module1( 'Testing /dashboard route', function(t){
  const dashboardOptions = {
    method:'GET',
    url:'/dashboard'
  };
  server.inject( dashboardOptions, function(res){
    t.plan(4);
    t.equal( res.statusCode, 200,'dashboard request results in a 200 status Code');
    t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/dashboard" route results in an html being sent back');
    t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/dashboard" route fetches default html template (which has a navbar)');
    t.ok( res.result.indexOf('<!-- this is the dashboard view -->') > -1 ,'"/dashboard" route sends back the dashboard html view');
  });
});
