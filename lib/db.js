// blogs
// create a blog POST
function createBlogPost(client, id, blogPost, callBack){
  client.HSET('posts', id, JSON.stringify(blogPost), callBack)
}
// edit a blog POST
// get a blog POST
// add comment to POST
// add like to POST

// users
// get user
// add user *
// delete user *

function editBlogPost(client, id, key, value, callBack){
  client.HGET('posts', id, function(error, reply){
    var blogPost = JSON.parse(reply);
    blogPost[key] = value;
    client.HSET('posts', id, JSON.stringify(blogPost), callBack)

  })

}

module.exports = {
  createBlogPost: createBlogPost,
  editBlogPost: editBlogPost
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
