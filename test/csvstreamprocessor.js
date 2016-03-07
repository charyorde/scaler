var Readable = require('stream').Readable,
    util = require('util'),
    fs = require('fs')

function CsvStreamProcessor(file) {

  var data = fs.readFileSync(file, 'utf8')

  Readable.call(this, {objectMode: true});
  this.data = data;
  this.curIndex = 0;
  
}

CsvStreamProcessor.prototype._read = function() {
  if (this.curIndex === this.data.length)
    return this.push(null);
 
  var data = this.data[this.curIndex++];
  //var data = this.data;
  console.log('read: ' + data);
  return this.push(data);
};
util.inherits(CsvStreamProcessor, Readable);

module.exports = CsvStreamProcessor;
