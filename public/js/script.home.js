function addListenerToNodeList(nodeList, eventType, callback) {
  Array.prototype.forEach.call(nodeList, function(node) {
    node.addEventListener(eventType, callback)
  })
}

addListenerToNodeList(document.getElementsByClassName('banana'), 'click', function(e) {
  var postId = e.target.parentNode.id;

  var xhr = new XMLHttpRequest();

  xhr.open('POST', '/like?id=' + postId)
  xhr.send()

  xhr.addEventListener('load', function(reply) {
    if (JSON.parse(reply.target.response).success) {
      var newLikes = parseInt(e.target.innerHTML);
      newLikes++;
      e.target.innerHTML = newLikes.toString();
    }
  })
})

// element with class 'comments' should be hidden by default.
// The 'show' class should then override its properties
addListenerToNodeList(document.getElementsByClassName('comments-btn'), 'click', function(e) {
  e.target.nextSibling.classList.toggle('show')
})

addListenerToNodeList(document.getElementsByClassName('comment-form'), 'submit', function(e) {
  e.preventDefault()
  var options = Array.prototype.reduce.call(e.target.children, function(acc, node) {
    acc[node.name] = node.value
    return acc;
  }, {})
  console.log(options);
  var author = e.target.children[0].value
  var id = e.target.children[2].value
  var body = e.target.children[1].value
  var url = '/comment?author='+ author+ "&body="+body+"&id="+id
  var xhr = new XMLHttpRequest()
  xhr.open('POST', url)
  xhr.send()

  xhr.addEventListener('load', function(reply){
    if(JSON.parse(reply.target.response).success) {
      var commentSection = e.target.nextSibling.nextSibling
      createComment(author, body, commentSection)
    }
  })
})


function createComment(author, body, section){
  var div = document.createElement('div')
  var h4 = document.createElement('h4')
  var p = document.createElement('p')
  h4.innerHTML = author
  p.innerHTML = body
  div.appendChild(h4)
  div.appendChild(p)
  section.appendChild(div)
}
