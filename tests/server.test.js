// require env2 to manage environment variables
require('env2')('./config.env');
// require node modules
var tape          = require('wrapping-tape');
const redis       = require('redis');
// require local modules
const server      = require('./../lib/server.js');
const db          = require("../lib/db.js");

// initialize redis client
var testclient    = redis.createClient(process.env.REDIS_URL);;
testclient.select( process.env.REDIS_DB || 0, function() {
  console.log('Connected to redis DB');
});

tape = tape({
  // at the beginning of each test suite...
  startup: function(t){
   // start server
    server.start(function(err){
      console.log('server has started and is listening on ',server.info.uri);
      console.log('TESTING SERVER AND ROUTING BEHAVIOUR');
    });
  },
  // at the end of each test suite...
  teardown: function(t){
    t.end();
    testclient.flushdb();
    server.stop();
  }
});

tape( 'Testing "/" route', function(t){

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

tape( 'Testing the serving of static files', function(t){
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

// tape( 'Testing /about route', function(t){
//   const aboutOptions = {
//     method:'GET',
//     url:'/about'
//   };
//   server.inject( aboutOptions, function(res){
//     t.plan(4);
//     t.equal( res.statusCode, 200,'about request results in a 200 status Code');
//     t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/about" route results in an html being sent back');
//     t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/about" route fetches default html template (which has a navbar)');
//     t.ok( res.result.indexOf('<!-- this is the about view -->') > -1 ,'"/login" route sends back the about html view');
//   });
// });
//

const newUserObj = {
  "username": "gorilla",
  "image": 'http://fillmurray.com/200/200', isAdmin: false,
  "secret": "$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa", // "password" with bcrypt
  "email": "gorilla@apes.primate",
  "spiel": 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
};
const addUserOptions = {
  method:'GET',
  url: '/adduser?username='+newUserObj.username+'&email='+newUserObj.email
}
tape('/adduser route will create a new user in the database and redirect to "/"',function(t){
  t.plan(2);
  server.inject( addUserOptions, function(res){
    db.getUser( testclient, 'gorilla', function(err,reply){
      t.ok(!err,'no error in retrieving user');
      console.log('reply', reply);
      t.deepEqual( reply.filter( x=> x.username === newUserObj.username )[0], newUserObj, "user has been added so /newuser routing works")
    });
  });
});


const basicHeader = function (username, password) {
  return 'Basic ' + ( new Buffer( username + ':' + password, 'utf8' ) ).toString( 'base64' );
};

tape( 'Testing /dashboard route with good params', function(t){
  // db has been flushed so new user needs to be added
  server.inject( addUserOptions );
  // providing authentication headers for request injection
  const authGood = basicHeader( 'gorilla', 'password' );
  const authOptionsGood = {
    method:'GET',
    url:'/dashboard',
    headers: { authorization: authGood }
  };

  t.plan(2);
  server.inject( authOptionsGood, function(res){
    t.equal( res.statusCode, 200,'about request with correct password results in a 200 status Code');
    t.ok( res.result.indexOf('<!-- this is the dashboard view -->')>-1, 'user has authenticated correcly and been redirected to dashboard');
  });
});

tape( 'Testing /dashboard route with bad params', function(t){
  // db has been flushed so new user needs to be added
  server.inject( addUserOptions );
  // providing authentication headers for request injection
  const authBad = basicHeader( 'impostor', 'ooops' );
  const authOptionsBad = {
    method:'GET',
    url:'/dashboard',
    headers: { authorization: authBad }
  };

  t.plan(2);
  server.inject( authOptionsBad, function(res){
    t.equal( res.statusCode, 401,'about request with incorrect password results in a 401 status Code');
    t.ok( res.result.indexOf('<!-- this is the dashboard view -->') === -1, 'user has not authenticated correcly and has not been redirected to dashboard');
  });
});
//
//   const authBad = {username:'impostor',password:'blah'};
//   const authOptionsBad = {
//     method:'POST',
//     url:'/auth',
//     headers: authBad
//   };
//   server.inject( authOptionsBad, function(res){
//     t.equal( res.statusCode, 401,'about request with wrong password results in a 404 status Code');
//     t.notEqual( res.result, 'you are the admin', 'user has authenticated correcly (this test will need to be changed later on)!');
//   });
// });

// tape( 'Testing /dashboard route', function(t){
//   const dashboardOptions = {
//     method:'GET',
//     url:'/dashboard'
//   };
//   server.inject( dashboardOptions, function(res){
//     t.plan(4);
//     t.equal( res.statusCode, 200,'dashboard request results in a 200 status Code');
//     t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/dashboard" route results in an html being sent back');
//     t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/dashboard" route fetches default html template (which has a navbar)');
//     t.ok( res.result.indexOf('<!-- this is the dashboard view -->') > -1 ,'"/dashboard" route sends back the dashboard html view');
//   });
// });

// tape("Testing that clicking edit redirects to the editpost page", function(t){
//   var newpostOptions = {
//     method: 'POST',
//     url: '/newpost',
//     payload: {
//       id: 12903,
//       title: 'firstblogpost',
//       author: 'testauthor',
//       body: "hjkfgjh",
//       comments: [],
//       likes: 0
//     }
//   };
//
//   server.inject(newpostOptions, function(res) {
//     t.plan(4);
//     t.equal( res.statusCode, 200,'/newpost post request results in a 200 status Code');
//     t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/newpost" route results in an html being sent back (redirection to dashboard)');
//     t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/newpost" route fetches default html template (which has a navbar)');
//     t.ok( res.result.indexOf('<!-- this is the dashboard view -->') > -1 ,'"/newpost" route sends back the dashboard html view');
//   });
// });


//
// var editpostOptions = {
//   method: 'GET',
//   url: '/editpost/'
// }
// //
// // server.inject( editpostOptions, function(res){
// //
// //   t.plan(4);
// //   t.equal( res.statusCode, 200,'editpost request results in a 200 status Code');
// //   t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/editpost" route results in an html being sent back');
// //   t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/editpost" route fetches default html template (which has a navbar)');
// //   t.ok( res.result.indexOf('<!-- this is the editpost view -->') > -1 ,'"/editpost" route sends back the editpost html view');
// // });
//  })
