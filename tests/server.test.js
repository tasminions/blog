// require env2 to manage environment variables
require('env2')('./config.env');
// require node modules
var tape          = require('wrapping-tape');
const redis       = require('redis');
// require local modules
const server      = require('./../lib/server.js');
const db          = require("../lib/db.js");

function authenticate(server, username, goodOrBad, callback){
  newUser(server, username);
  const authOptions = {
    method:'GET',
    url:'/dashboard'

  };
  addHeader(username, goodOrBad, authOptions);
  server.inject(authOptions, callback);
}

function addHeader(username, goodOrBad, options) {
  const authGood = 'Basic ' + ( new Buffer( username + ':' + 'password', 'utf8' ) ).toString( 'base64' );
  const authBad = 'Basic ' + ( new Buffer( 'wrongwrongwrong' + ':' + 'password', 'utf8' ) ).toString( 'base64' );
  var auth = (goodOrBad === 'good' ? authGood : authBad );
  options.headers = {
    authorization: auth
  }
  return options;
}

function newUser(server, username, callback) {
  const newUserObj = {
    "username": username,
    "image": 'http://fillmurray.com/200/200', isAdmin: false,
    "secret": "$2a$04$uOkR8kWenZ/CZKp5Lgw6Sue8gFOCMMqfUFwEMmFdxhoyTuhanxXMa", // "password" with bcrypt
    "email": "gorilla@apes.primate",
    "spiel": 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  };
  const addUserOptions = {
    method:'GET',
    url: '/adduser?username='+newUserObj.username+'&email='+newUserObj.email
  };
  server.inject( addUserOptions, callback);
}

function createNewPost( server, callback ){
  // creating user
  var username = 'testauthor'
  authenticate(server, username, 'good');

  // creating parameters for newpost injection
  var newpostOptions = {
    method: 'POST',
    url: '/newpost',
    payload: {
      title: 'firstblogpost',
      author: username,
      body: "hjkfgjh",
      comments: [],
      likes: 0
    }
  }
  // adding authentication header to /newpost request
  addHeader(username, 'good', newpostOptions);
  // injecting /newpost request to server
  server.inject( newpostOptions, callback );
}

function getDashboard(server, callback){
  // creating parameters for /dashboard request
  var dashboardOptions = {
    method: 'GET',
    url: '/dashboard'
  }
  // adding authentication header to /dashboard request
  addHeader('testauthor', 'good', dashboardOptions);
  server.inject( dashboardOptions, callback );
}

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
    // testclient.flushdb();
    t.end();

    server.stop();
  }
});

// tape( 'Testing "/" route', function(t){
//
//   const indexOptions = {
//     method:'GET',
//     url:'/'
//   };
//   server.inject( indexOptions, function(res){
//     t.plan(4);
//     t.equal( res.statusCode, 200,'/ request results in a 200 status Code');
//     t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/" route results in an html being sent back');
//     t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/" route sends back the default html template (which has a navbar)');
//     t.ok( res.result.indexOf('<!-- this is the index view -->') > -1 ,'"/" route sends back the index html view');
//   });
// });
//
// tape( 'Testing the serving of static files', function(t){
//   const staticOptions = {
//     method:'GET',
//     url:'/public/css/main.css'
//   };
//   server.inject( staticOptions, function(res){
//     t.plan(2);
//     t.equal( res.statusCode, 200,'css request results in a 200 status Code');
//     t.equal( res.headers['content-type'], 'text/css; charset=utf-8', 'css request sends back a file with css content-type.');
//   });
// });
//
// // tape( 'Testing /about route', function(t){
// //   const aboutOptions = {
// //     method:'GET',
// //     url:'/about'
// //   };
// //   server.inject( aboutOptions, function(res){
// //     t.plan(4);
// //     t.equal( res.statusCode, 200,'about request results in a 200 status Code');
// //     t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/about" route results in an html being sent back');
// //     t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/about" route fetches default html template (which has a navbar)');
// //     t.ok( res.result.indexOf('<!-- this is the about view -->') > -1 ,'"/login" route sends back the about html view');
// //   });
// // });
// //
//
// tape('/adduser route will create a new user in the database and redirect to "/"',function(t){
//   t.plan(2);
//
//   newUser(server, 'gorilla', function(newUserObj){
//     db.getUser( testclient, 'gorilla', function(err,reply){
//       t.ok(!err,'no error in retrieving user');
//       t.ok( reply.filter( x=> x.username === 'gorilla' )[0], "user has been added so /newuser routing works")
//     });
//   });
//
// });
//
// tape( 'Testing /dashboard route with good params', function(t){
//   authenticate(server, 'gorilla', 'good', function(res){
//     t.plan(2);
//     t.equal( res.statusCode, 200,'about request with correct password results in a 200 status Code');
//     t.ok( res.result.indexOf('<!-- this is the dashboard view -->')>-1, 'user has authenticated correcly and been redirected to dashboard');
//   });
// });
//
// tape( 'Testing /dashboard route with bad params', function(t){
//   // db has been flushed so new user needs to be added
//   authenticate(server, 'chimp', 'bad', function(res){
//     t.plan(1);
//     t.equal( res.statusCode, 401,'/dashboard request with incorrect password results in a 401 status Code');
//   });
// });
//
// tape("Testing that posts can be created and edited.", function(t){
//   t.plan(4);
//   // injecting /newpost request to server
//   createNewPost( server, function(ans) {
//     t.equal( ans.statusCode, 302,'/newpost post request redirects to /dashboard resulting in a 302 status Code');
//     // injecting /dashboard request to server
//     getDashboard( server, function(res){
//       t.ok( res.result.indexOf('<!-- this is the dashboard view -->') > -1 ,'"/newpost" route sends back the dashboard html view');
//       t.ok( res.result.indexOf('firstblogpost') > -1 ,'dashboard has the new post title');
//       t.ok( res.result.indexOf('<a href="/editpost/') > -1 ,'dashboard has a link to the newly created post');
//     });
//   });
// });

tape('Testing /editpost/{id} will retrieve the selected post', function(t){
  t.plan(10);
  var id;
  createNewPost( server, function(ans){
    getDashboard( server, function(dashboard){
      id = dashboard.result.split('<p class="hide">')[1].split('</p>')[0];

      var editOptions = {
        method: 'GET',
        url: '/editpost/'+ id
      }
      // adding authentication header for /editpost request
      addHeader('testauthor', 'good', editOptions)
      // injecting /editpost request to server
      server.inject( editOptions, function(res) {
        t.equal( res.statusCode, 200,'editpost request results in a 200 status Code');
        t.ok( res.result.indexOf('<!DOCTYPE html>') > -1 ,'"/editpost" route results in an html being sent back');
        t.ok( res.result.indexOf('class="navbar"') > -1 ,'"/editpost" route fetches default html template (which has a navbar)');
        t.ok( res.result.indexOf('<!-- this is the editpost view -->') > -1 ,'"/editpost" route sends back the editpost html view');
        t.ok( res.result.indexOf('firstblogpost') > -1, "editpost page contains title");
        t.ok( res.result.indexOf('hjkfgjh') > -1, "editpost page contains blog post body");
        t.ok( res.result.indexOf('<input type="Submit" value="SAVE">') > -1, "editpost page contains Save button");

        // creating parameters for /savepost request injection
        var saveOptions = {
          method: 'POST',
          url: '/savepost/'+id,
          payload: {
            title: 'firstblogpost-updated',
            author: 'testauthor',
            body: "this has been modified, be aware!!",
            comments: [],
            likes: 0
          }
        };
        // adding authentication header for /savepost request
        addHeader('testauthor', 'good', saveOptions);
        // saving the newly created post by injecting a /savepost request to the server
        server.inject( saveOptions, function( saveRes ){
          t.equal( saveRes.statusCode, 302, '/savepost redirects and gives a 302 statusCode');
          // getting updated dashboard upon saving being completed
          getDashboard( server, function ( dashboardRes){
            t.ok( saveRes.result.indexOf('<!-- this is the dashboard view -->') > -1 ,'"/savepost" route sends back the dashboard html view');
            t.ok( saveRes.result.indexOf('firstblogpost-updated') > -1 ,'dashboard has the updated post title');
          });
        });

        });
      })
    });
  });
})


// tape('Testing that posts will be saved upon save button being clicked', function(t){
//   t.plan();
//
//   createNewPost( server );
//   // server.inject( )
// });
