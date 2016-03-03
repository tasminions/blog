var Helpers = (function() {
  return {
    addListenerToNodeList: function (nodeList, eventType, callback) {
      Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(eventType, callback)
      })
    },

    newXhr: function (method, url, loadCallback) {
      var xhr = new XMLHttpRequest()

      xhr.open(method, url)
      xhr.send()
      xhr.addEventListener('load', loadCallback)

      return xhr
    },

    parseObjectToQueryString: function (obj) {
      return Object.keys(obj).map(function(key) {
        return key + '=' + obj[key]
      }).join('&')
    },

    parseNodeListToObject: function(nodeList) {
      return Array.prototype.reduce.call(nodeList, function(acc, node) {
        acc[node.name] = node.value
        return acc
      }, {})
    },

    createComment: function (author, date, body, section){
      var div = document.createElement('div')
      var h4 = document.createElement('h4')
      var p = document.createElement('p')
      h4.innerHTML = 'Comment by: ' + author + ', on: ' + date
      p.innerHTML = body
      div.appendChild(h4)
      div.appendChild(p)
      section.appendChild(div)
    }
  }
})()
