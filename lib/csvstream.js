var Readable = require('stream').Transform,
    util = require('util'),
    fs = require('fs')

function CsvStream(file) {
  var args = arguments
  Readable.call(this, {objectMode: true});
  if (file) {
    var data = fs.createReadStream(file)
    data.pipe(this)

    this.data = data;
    this.curIndex = 0;
  }
}

util.inherits(CsvStream, Readable);

CsvStream.prototype._transform = function(chunk, encoding, done) {
  if (this.curIndex === this.data.length)
    return this.push(null);
 
  var data = chunk.toString()
  if (this._lastLineData) data = this._lastLineData + data
  var lines = data.split('\n')
  // Don't stream empty lines
  this._lastLineData = lines.splice(lines.length-1,1)[0]
  lines.forEach(this.push.bind(this)) 
  done()
};


module.exports = CsvStream;
