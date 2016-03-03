// blogs
// create a blog POST
function createBlogPost(client, id, blogPost, callBack){
  client.HSET('posts', id, JSON.stringify(blogPost), callBack)
}

// edit a blog POST
function editBlogPost(client, id, object, callBack){
  client.HGET('posts', id, function(error, reply){
    var blogPost = JSON.parse(reply);
    blogPost.title = object.title;
    blogPost.body = object.body;
    client.HSET('posts', id, JSON.stringify(blogPost), callBack)
  })
}

// get a blog POST
function getPosts(client, user, callBack) {
  client.HGETALL('posts', function(error, reply) {
    if (reply) {
      var list = Object.keys(reply).map(id => JSON.parse(reply[id]));
      if (user === 'all') {
        callBack(error, list)
      } else {
        list = list.filter(post => {return post.author === user})
        callBack(error, list)
      }
    } else {
      callBack(null, [])
    }
  })
}

function getSinglePost(client, id, callBack) {
  client.HGET('posts', id, function(error, reply) {
    if (reply) {
      callBack(error, JSON.parse(reply));
    } else {
      callBack(null, {});
    }
  })
}

// add comment to POST
function addComment(client, id, comment, callBack) {
  client.HGET('posts', id, function(error, reply) {
    var post = JSON.parse(reply)
    post.comments.push(comment)
    client.HSET('posts', id, JSON.stringify(post), callBack)
  })
}
// add like to POST
function likePost(client, id, callBack){
  client.HGET("posts", id, function(err, reply){
    var post = JSON.parse(reply)
    post.likes++
    client.HSET("posts", id, JSON.stringify(post), callBack)
  })
}
// users
// get user
function getUser(client, username, callBack) {
  client.HGETALL('users', function(err, reply) {
    var list = Object.keys(reply).map(k => JSON.parse(reply[k]))
    if (username === 'all') {
      callBack(null, list)
    } else {
      list = list.filter(function(userObj){
        return userObj.username === username
      })
      callBack(null, list)
    }
  })
}

// add user * ???
function addUser(client, username, userObj, callBack){
  client.HSET('users', username, JSON.stringify(userObj), callBack)
}

// delete user * ???


module.exports = {
  createBlogPost: createBlogPost,
  editBlogPost: editBlogPost,
  addComment: addComment,
  likePost: likePost,
  getPosts: getPosts,
  addUser: addUser,
  getUser: getUser,
  getSinglePost: getSinglePost
}

// {
//   "posts": {
//     "29382": {
//       "id": "9352",
//       "title": "ifn",
//       "author": "ownwv",
//       "date": "fwepihrv",
//       "body": "Liwehofrg",
//       "comments": [{
//         "author": "foence",
//         "date": "eqfbwr",
//         "body": "ewobrw"
//       }, {
//         "author": "foence",
//         "date": "eqfbwr",
//         "body": "ewobrw"
//       }],
//       "likes": 234
//   },
//   "users": {
//     "john": {
//       "secret": "piqhefwc",
//       "isAdmin": true,
//       "email": "rwohgj"
//     }
//   }
// }
