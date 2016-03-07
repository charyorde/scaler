var pg = require('any-db');
var config = require(__dirname + '/../config')()
var db = require(__dirname + '/db')
var _ = require('underscore')
var querystring = require('querystring')

var postgresdb = function(options) {
  
  var dbConn = config.db.postgres.uri
  var impl = db(options)
  var client = pg.createPool(dbConn, {min: 2, max: 25})

  client.on('connection', function(connection) {
    // get the connection details for every connection
    console.log('Postgres is connected');
  })

  client.on('error', function(err) {
    // know who dropped off the connection
    console.log("Couldn't connect to postgres", err)
  })

  client.on('drain', function(drain) {
    // know when the connection is idling
  })

  impl.get = function(data, model) {
  
  };

  impl.query = function(query, fn) {
    client.query(query, function(err, result) {
      if(err) {
        console.log("Couldn't query db", err)
        return fn(err)
      }
      console.log("Query results:", result.rows)
      return fn(null, result.rows)
    })
  }

  impl.preparedQuery = function(query, params, fn) {
    client.query(query, params, function(err, result) {
      if(err) {
        console.log("Couldn't query db", err)
        return fn(err)
      }
      console.log("Query results:", result.rows)
      return fn(null, result.rows)
    })
  }

  impl.update = function(query, fn) {
    console.log("Postgres Query: Performing update query")
    var clientOptions = { 'prepare': true }; 
    var options = data.options; 
    var fields = data.fields;
    var query = null;
    var fieldItems = [], opts = [];
    var types = ['string', 'number', 'boolean']
    var collectiontypes = ['list', 'object']

    _.each(fields, function(value, key, list) {
      if(_.contains(types, typeof value)) fieldItems.push(key + ' = ' + value)
      if(typeof value == 'object') fieldItems.push(key + ' = ' + list.interests)
    });

    var params = (_.size(fieldItems) == 1) ? fieldItems : fieldItems.join(', ');
    query = 'update ' + model + ' set ' + params; 
    _.each(options, function(value, key, list) {
      opts.push(key + ' = ' + value);
    });

    var query_opts = (_.size(opts) == 1) ? opts : opts.join(' AND ');
    query = query + ' WHERE ' + query_opts; 
    console.log("update query ", query)
    // run update query on the model
    client.query(query, data, clientOptions, function(err, result) {
      if (err) {
        return fn(err)
      }
      console.log("UPDATE QUERY: Row updated Successfully")
      return fn(null, "Row updated successfully");
    });
  }

  return impl
}

module.exports = postgresdb({})
