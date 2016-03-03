var likeBtns = document.getElementsByClassName('banana');

Array.prototype.forEach.call(likeBtns, function(btn) {
  btn.addEventListener("click", function(e) {
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
})

var commentBtns = document.getElementsByClassName('comments-btn')

// ul with class 'comments' should be hidden by default.
// The 'show' class should then override its properties
Array.prototype.forEach.call(commentBtns, function(btn) {
  btn.addEventListener('click', function(e) {
    e.target.nextSibling.classList.toggle('show')
  })
})

var commentForm = document.getElementsByClassName('comment-form')
Array.prototype.forEach.call(commentForm, function(btn){
  btn.addEventListener('submit', function(e){
    e.preventDefault()
    var author = e.target.childNodes[1].value
    var id = e.target.childNodes[5].value
    var body = e.target.childNodes[3].value
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
