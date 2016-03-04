[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)](https://github.com/tasminions/minionchat)
[![Code Climate](https://codeclimate.com/github/tasminions/blog/badges/gpa.svg)](https://codeclimate.com/github/tasminions/blog)
[![Issue Count](https://codeclimate.com/github/tasminions/blog/badges/issue_count.svg)](https://codeclimate.com/github/tasminions/blog)
[![Test Coverage](https://codeclimate.com/github/tasminions/blog/badges/coverage.svg)](https://codeclimate.com/github/tasminions/blog/coverage)
[![Codecrystal](https://img.shields.io/badge/code-crystal-5CB3FF.svg)](http://codecrystal.herokuapp.com/crystalise/tasminions/blog/master)
# Blog

Check it out on heroku! http://tasminionsblog.herokuapp.com/

## What & Why
This is a blog about monkeys made with hapijs, with the purpose of practicing the following topics (specified here):
server routes
authentication
SASS framework
saving created/edited posts on a database.

## Wireframes

![user-story](public/img/user-story.jpg)

![folder-structure](public/img/folder-structure.jpg)

![routes](public/img/routes.jpg)

![homepage](public/img/homepage.jpg)

![about](public/img/about.jpg)

![dashboard](public/img/dashboard.jpg)

![editpost](public/img/editpost.jpg)

![newpost](public/img/newpost.jpg)

## Data Structure
```
{
  "posts": {
    "29382": {
      "id": "9352",
      "title": "ifn",
      "author": "ownwv",
      "date": "fwepihrv",
      "body": "Liwehofrg",
      "comments": [{
        "author": "foence",
        "date": "eqfbwr",
        "body": "ewobrw"
      }, {
        "author": "foence",
        "date": "eqfbwr",
        "body": "ewobrw"
      }],
      "likes": 234
  },
  "users": {
    "john": {
      "secret": "piqhefwc",
      "isAdmin": true,
      "email": "rwohgj"
    }
  }
}
```
## Instructions

In order to get a chat room hosted on your machine, follow these instructions:

+ Setup a redis instance
+ Clone the repo
+ Run npm install
+ Create a config.env file with the following lines:  
  + REDIS_URL=reds://url/to/redis/server
  + REDIS_DB=[int] # whichever database number you want to run
  + PORT=[int] # whichever port you want to run
  + Run npm start and navigate to http://localhost:[PORT]
