var amqp = require('./socket').amqp

function withContext(fn) {
    return fn(amqp);
}

var liveContext = function(fn) {
  return function() {
    withContext(function(ctx) {
      ctx.on('ready', function() {
        return fn(ctx)
      })
    })
  }
}

amqp.on('ready', function() {
  console.log("Queue ready to publish...")
  
  var worker = amqp.socket('WORKER');
  worker.setEncoding('utf8');

  (function() {
    
    // Queue consumer
    worker.connect('newuser_queue', function() {
      worker.on('data', function(msg) {
        // #ack on it to acknowledge that you have processed each message
        worker.ack()
        console.log("consuming messages from newuser_queue", msg.toString())
      })
    })
  })();
})
