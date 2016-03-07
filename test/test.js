var assert = require('assert')
  , should = require('should')
  , _ = require('underscore')
  , async = require('async')
  , fs = require('fs')
  , Stream = require('stream')
  , readableStream = new Stream.Transform( { objectMode: true } )
  , psql = require('./db-helper')
  
describe('tombstone', function() {
  describe('#unit', function() {
    it('should spill out objects from array', function() {
      obj = { 
        "users_analytics" : [ {
            "total" : 1015,
            "total_active_users" : 5
          } ]
      }
      console.log(obj['users_analytics'][0])
      _.isArray(obj['users_analytics']).should.be.ok
    })
  })
  it('should run callback functions in parallel', function(done) {
    var func1 = function(fn) {
      return fn(null, "Hello")
    }
    var func2 = function(fn) {
      return fn(null, "John")
    }
    function func3(fn) {
      async.parallel([func1, func2
        ],
        function(err, result) {
          return fn(err, result)
        }
      )
    }

    func3(function(err, res) {
      console.log("func3 result", res)
      res.should.be.ok
      done()
    })
  })
  it('should run callback functions in series', function(done) {

    var cookcalls = 0
      //, ingredients = ['one', 'two']
      , ingredients = {"v4.2.0": [{one: {"method": "POST"}, two: {"method": "PUT"}}]}
      , funcs = {}
      , tasks = {}
    var cook = function(params) {
      //cookcalls++
      //console.log("cookcalls called ", cookcalls + " times ")
      //fn(null, cookcalls + " time(s)." + params + " function")
      console.log("params are: ", params)
      return "params are: " + params
    }
    _.each(ingredients["v4.2.0"], function(value, item) {
      funcs[item] = function(fn) {
        cookcalls++   
        console.log("cookcalls called ", cookcalls + " times ")
        cook(value)
        fn(null, cookcalls + " times(s). params are: " + value)
      }
    })
    _.extend(tasks, funcs)
    //console.log(_.extend(tasks, funcs))
    function func3(fn) {
      async.series(tasks, 
        function(err, result) {
          return fn(err, result)
        }
      )
    }
    func3(function(err, res) {
      console.log("cookie result", res)
      res.should.be.ok
      done()
    })
  })
  it('should get the first key of an object', function() {
    obj = {'top_10_users': [{'username': 'johndoexyz'}, {'username': 'janedoexyz'}]}
    keys = _.keys(obj)
    console.log(keys)
    keys.should.be.ok
    assert.equal(keys[0], 'top_10_users')
  })
  it('should contain some array items', function(done) {
    var actual = ['name', 'title']
    var expected = ['username', 'verified']
    function isFound(item, fn) {
      console.log('item is', item)
      if(_.contains(expected, item)) {
        fn(true)
      } else {
        fn(false)
      }
    }
    async.some(actual, isFound, function(result) {
      if(result) {
        console.log(result)
        result.should.be.ok
      } else {
        assert.equal(result, true)
        done()
      }
    })
  })
  it('should match obj key in arr', function() {
    var arr = [ { bob: 'marley' }, { annie: 'macauley' } ]
    _.each(arr, function(val, key) {
      console.log(val)
      var keys = Object.keys(val)
      if(Object.keys(val) == ['bob']) {
        item = arr[key]
        console.log(item)
        assert.equal('marley', item)
      }
    })
  })
  it('should stream a csv file', function(done) {
    var source = fs.createReadStream('./data.csv')
    source.pipe(readableStream)
    readableStream._transform = function(chunk, encoding, doner) {
      var data = chunk.toString()
      var lines = data.split('\n')
      lines.forEach(this.push.bind(this)) 
      doner()
    }
    readableStream.on('data', function(data) {
      //var data = readableStream.read()
      if (!data) {
        should(data).not.be.ok
      }
      console.log("Streaming... ", data)
      data.should.be.ok
    }) 
    readableStream.on('end', function() {
      console.log('done');
      done()
    });
  })
  it('should test a read stream', function(done) {
 
    var ReadStream = require('./csvstreamprocessor');
    var stream = new ReadStream('./data.csv');
    //stream.pipe(process.stdout)
    stream.on('data', function(record) {
      console.log('received: ' + record);
    done()
    });
    stream.on('end', function() {
      console.log('done');
    }); 
  })
  it('should write a db record', function(done) {
    var names = ['John', 'john@test.org'] 
      , query = "INSERT INTO testusers(name, email) VALUES($1, $2)"

    psql.preparedQuery(query, names, function(err, result) {
      if(err) {
        console.log(err)
        assert.isNull(err)
      }
      else {
        console.log(result)
        result.should.be.ok       
      }
      done()
    })
  })
})
