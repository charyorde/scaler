var fs = require('fs')
var path = require('path')
var config = require(__dirname + '/../config')()
  , Promise = require('bluebird')
  , fsAsync = Promise.promisifyAll(require("fs"))
  , helpers = require('./helpers')


function fsUtils() {

  this.savePublic = function(file, fn) {
    var filestr = JSON.stringify(file).replace(/"/g, "'")
    // check if file exists
    fs.exists(file, function(exists) {
      if(exists) {
        fs.open(file, 'r', function(err, fd) {
          if(err) {
            console.log("Couldn't open file", err)
            return fn(err)
          }
          console.log("FsUtils: File exists. Moving %s", file)
          // get the filename plus extension
          var basename = path.basename(file)
          //var dest = JSON.stringify(config.statics.public_dir + basename).replace(/"/g, "'")
          var dest = config.statics.public_dir + basename
          // upload file to permanent location
          fs.rename(file, dest, function(err) {
            if(err) return fn(err)
            console.log("Successfully moved %s to the static file server", file)
            // set imageurl value to new value.
            var url = JSON.stringify(config.statics.uri + basename).replace(/"/g, "'")
            return fn(null, url)
          })
        })
      }
      else {
        console.log("Profile Update. file %s does not exists", file)
        return fn(new Error('File does not exist'))
      }
    })

  }

  this.readContent = function(file, fn) {
    fsAsync.readFileAsync(file)
    .then(function(data) {
      return fn(null, data)
    })
    .catch(function(e) {
      return fn(e)
    })
  }
}

module.exports = new fsUtils()
