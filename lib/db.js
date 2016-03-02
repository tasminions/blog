// blogs
// create a blog POST
function createBlogPost(client, id, blogPost, callBack){
  client.HSET('posts', id, JSON.stringify(blogPost), callBack)
}

// edit a blog POST
function editBlogPost(client, id, key, value, callBack){
  client.HGET('posts', id, function(error, reply){
    var blogPost = JSON.parse(reply);
    blogPost[key] = value;
    client.HSET('posts', id, JSON.stringify(blogPost), callBack)
  })
}

// get a blog POST
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
// add user *
// delete user *


module.exports = {
  createBlogPost: createBlogPost,
  editBlogPost: editBlogPost,
  addComment: addComment,
  likePost: likePost
}

// {
//   "posts": {
//     "29382": {
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
//       "pw": "piqhefwc",
//       "isAdmin": true,
//       "email": "rwohgj"
//     }
//   }
// }
