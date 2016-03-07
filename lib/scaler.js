var events = require('events')
  , util = require('util')
  , fs = require('./file')
  , Promise = require('bluebird')
  , CsvStream = require('./csvstream')
  , psql = require(__dirname + '/../db/postgresql')
  , amqp = require('./socket').amqp

function Scaler(file) {

  var self = this
  events.EventEmitter.call(this);

  var csvstream = new CsvStream(file)

  csvstream.on('data', function(data) {
    console.log("Streaming... ", data)
    // Node spins up 4 threads by default, therefore should
    // be able to handle this blocking task without spinning
    // up a separate process.
    // Otherwise, we're already increasing the threads with:
    // process.env.UV_THREADPOOL_SIZE = [custom value]

    var user = data.split(',')
    
    // queue data
    self.queue({
      channel: 'newuser_queue',
      message: user
    })

    // write to db
    if (user !== null || user !== undefined) {
      var query = "INSERT INTO testusers(name, email) VALUES($1, $2)";
      psql.preparedQuery(query, user, function(err, result) {
        if(err) {
          console.log("%s write failed:", user, err);
        }
        console.log("%s saved", user)
      });
     }
  })

  csvstream.on('end', function() {
    console.log('done')
  })

  this.queue = function(params) {
    console.log("published")
    channel = params.channel ? params.channel : undefined
    message = params.message ? params.message : {}

    var queue = amqp.socket('PUSH');

    queue.connect(channel, function() {
      queue.write(JSON.stringify(message), 'utf8');
    })
  }
  
  this.saveToDb = function(user, fn) {
    if (user !== null || user !== undefined) {
      var query = "INSERT INTO testusers(name, email) VALUES($1, $2)";
      psql.preparedQuery(query, user, function(err, result) {
        if(err) {
          console.log("Error:", err);
          return fn(err);
        }
        return fn(null, true);
      });
     }
  };
}

util.inherits(Scaler, events.EventEmitter)
module.exports = Scaler
