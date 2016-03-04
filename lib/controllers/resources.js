module.exports = {
  method: 'GET',
  path:   '/public/{param*}',
  handler: {
    directory: {
      path: Path.join(__dirname,'/../public/')
    }
  }
}
