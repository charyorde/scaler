assert = require('assert');

var EventEmitter = require('events').EventEmitter;
//var pg = require('pg')
//var Connection = pg.Connection
//var Client = new pg.Client()
var config = require(__dirname + '/../config')()
var db = require(__dirname + '/../db/db')
var pg = require('any-db')

var postgresdb = function(options) {

  var dbConn = 'postgres://root:P@ssw0rd15@localhost:5432/microapps'
  var impl = db(options)
  // ensure we use a single client for testing
  var client = pg.createPool(dbConn, {min: 1, max: 1})
  
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

  return impl
}

module.exports = postgresdb({})
