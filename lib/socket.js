// Messaging using Rabbit.js
var config = require(__dirname + '/../config')()
//var amqp = require('rabbit.js').createContext('amqp://test:Wordpass15@192.168.10.29:5672')
var amqp = require('rabbit.js').createContext(config.rabbit.uri)
exports.amqp = amqp
