module.exports = {
  getDateString: function(ms) {
    if (typeof ms === 'undefined') ms = Date.now()
    var date = new Date(ms)
    return date.toISOString().split('T')[0]
  }
}
