// On clicking the like button, the /like endpoint on the server stores the like in the DB,
// and the new like total is also immediately added to the DOM // synchronicity issues!
Helpers.addListenerToNodeList(document.getElementsByClassName('banana'), 'click', function(e) {
  var postId = e.target.parentNode.id;

  Helpers.newXhr('POST', '/like?id=' + postId, function(reply) {

    if (JSON.parse(reply.target.response).success) {
      var newLikes = parseInt(e.target.innerHTML);
      newLikes++;
      e.target.innerHTML = newLikes.toString();
    }

  })
})

// On comment form submission, the /comment endpoint on the server stores the comment in the DB,
// and the new comment is also immediately added to the DOM // synchronicity issues!
Helpers.addListenerToNodeList(document.getElementsByClassName('comment-form'), 'submit', function(e) {
  e.preventDefault()

  var options = Helpers.parseNodeListToObject(e.target.children)
  var url = (options) ? '/comment?' + Helpers.parseObjectToQueryString(options) : '/comment'

  var date = new Date(Date.now())
  var dateStr = date.toISOString().split('T')[0]

  Helpers.newXhr('POST', url, function(reply){
    if(JSON.parse(reply.target.response).success) {
      var commentSection = e.target.nextElementSibling
      Helpers.createComment(options.author, dateStr, options.body, commentSection)
    }
  })
})

// Element with class 'comments' should be hidden by default.
Helpers.addListenerToNodeList(document.getElementsByClassName('comments-btn'), 'click', function(e) {
  e.target.nextElementSibling.classList.toggle('hide')
})
