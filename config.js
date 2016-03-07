var url = require('url')
var cfenv = require("cfenv")
var appEnv = cfenv.getAppEnv()
var rabbitUri = null
var postgresUri = null

if(!appEnv.isLocal) {
  // rabbit ups
  rabbitService = appEnv.getService('rabbitmq')
  rabbitCreds = rabbitService.credentials
  var rabbitObj = {
    protocol: 'amqp',
    slashes: true,
    auth: [rabbitCreds.username, rabbitCreds.password].join(':'),
    hostname: rabbitCreds.host,
    port: rabbitCreds.port
  }
  rabbitUri = url.format(rabbitObj)
  
  // postgres ups
  pgService = appEnv.getService('postgres-test')
  pgcreds = pgService.credentials
  var pgobj = {
    protocol: 'postgres',
    slashes: true,
    auth: [pgcreds.username, pgcreds.password].join(':'),
    hostname: pgcreds.host,
    port: pgcreds.port,
    pathname: pgcreds.db
  }
  postgresUri = url.format(pgobj)
  console.log("postgresUri", postgresUri)
}
if(process.env.DOCKER) {
  console.log("ENV", require('util').inspect(process.env, {showHidden: false, depth: null}))
}

var vcap_services;
var vcap_application
if(process.env.VCAP_SERVICES) {
  vcap_services = JSON.parse(process.env.VCAP_SERVICES)
  console.log(vcap_services)
}
if(process.env_VCAP_APPLICATION) {
  vcap_application = JSON.parse(process.env.VCAP_APPLICATION)
  console.log(vcap_application)
}

var config = {
  local: {
    appname: 'microapps',
    mode: 'local',
    port: process.env.VCAP_APP_PORT || 3006,
    protocol: 'http',
    uri: 'http://localhost:3006',
    rabbit: {
      uri: 'amqp://localhost',
      user: 'guest',
      pass: 'guest',
      testhosturi: 'amqp://guest:guest@localhost:5672'
    },
    db: {
      postgres: {
        uri: 'postgres://root:P@ssw0rd15@localhost:5432/microapps',
        host: 'localhost',
        name: 'microapps',
        port: 5432
      }
    }
  },
  dev: {
    appname: appEnv ? appEnv.name : 'microapps',
    mode: 'dev',
    port: process.env.VCAP_APP_PORT || process.env.PORT,
    protocol: 'http',
    uri: appEnv ? appEnv.url : undefined,
    rabbit: {
      uri: 'amqp://test:Wordpass15@192.168.10.29:5672',
      user: 'guest',
      pass: 'guest',
      testhosturi: 'amqp://test:Wordpass15@192.168.10.29:5672'
    },
    db: {
      postgres: {
        uri: postgresUri,
        host: 'localhost',
        name: 'microapps',
        port: 5432
      }
    }
  
  },
  docker: {
    appname: 'microapps',
    mode: 'docker',
    port: process.env.PORT || 3006,
    protocol: 'http',
    uri: 'http://localhost:3006',
    rabbit: {
      uri: url.format({
        protocol: 'amqp',
        slashes: true,
        auth: [process.env.RABBITMQ_DEFAULT_USER || 'guest', process.env.RABBITMQ_DEFAULT_PASS || 'guest'].join(':'),
        hostname: process.env.RABBITMQ_HOST || 'scaler-rabbit',
        port: process.env.RABBITMQ_PORT || 5672
      })
    },
    db: {
      postgres: {
        uri: url.format({
          protocol: 'postgres',
          slashes: true,
          auth: [process.env.POSTGRES_USER || 'postgres', process.env.POSTGRES_PASSWORD || 'postgres'].join(':'),
          hostname: process.env.POSTGRES_HOST || '172.17.0.14',
          port: process.env.POSTGRES_PORT_5432_TCP_PORT || 5432,
          pathname: process.env.POSTGRES_DB || 'postgres'
        })
      }
    }
  
  }
}

module.exports = function(mode) {
  var isdocker = process.env.DOCKER ? true : false
  //var env = appEnv.isLocal ? 'local' : isdocker ? process.env.DOCKER : appEnv.app.space_name
  var env = isdocker ? process.env.DOCKER : appEnv.isLocal ? 'local' : appEnv.app.space_name
  return config[mode || env || 'local'] || config.local;
};
module.exports.cfenv = appEnv
