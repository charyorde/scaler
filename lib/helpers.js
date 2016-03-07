/**
 * App helpers
 */
var _ = require('underscore');
var crypto = require('crypto')
var async = require('async')
var Promise = require('bluebird')

function helpers() {}

// Converts each item in an array to string
helpers.prototype.arrstr = function(arr) {

  _.each(arr, function(item) {
    return item.toString();
  });
};

helpers.prototype.containsVal = function(list, val) {
  var found = false
  _.map(list, function(item, key) {
    if(_.isObject(item)) {
      _.map(item, function(v, k) {
        if (v === val) {
          found = true
        }
      })
    }
    else if (item === val) {
      found = true
    }
  })
  return found
};

helpers.prototype.isUrl = function(str) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
};

/**
 * Generates a URL
 */ 
helpers.prototype.makeUrl = function() {
  
};

helpers.prototype.algorithmMap = function() {
  return {
    HS256: 'sha256',
    HS384: 'sha384',
    HS512: 'sha512',
    RS256: 'RSA-SHA256'
  }
};

helpers.prototype.typeMap = function() {
  return {
    HS256: 'hmac',
    HS384: 'hmac',
    HS512: 'hmac',
    RS256: 'sign'
  }
};

helpers.prototype.jwtTokenVerify = function(input, key, method, type, signature) {
  console.log("token type", type)
  if(type === "hmac") {
    return (signature === this.sign(input, key, method, type));
  }
  else if(type == 'sign') {
    return crypto.createVerify(method)
      .update(input)
      .verify(key, this.base64urlUnescape(signature), 'base64')
  }
  else {
    throw new Error('Algorithm type not recognized')
  }
};

helpers.prototype.sign = function(input, key, method, type) {
  var base64str;
  if (type === "hmac") {
    base64str = crypto.createHmac(method, key).update(input).digest('base64');
  }
  else if (type == "sign") {
    base64str = crypto.createSign(method).update(input).sign(key, 'base64');
  }
  else {
    throw new Error('Algorithm type not recognized');
  }
  return this.base64urlEscape(base64str)
};

helpers.prototype.base64urlEscape = function(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

helpers.prototype.base64urlUnescape = function(str) {
  str += new Array(5 - str.length % 4).join('=');
  return str.replace(/\-/g, '+').replace(/_/g, '/');
};

helpers.prototype.base64urlDecode = function(str) {
  return new Buffer(this.base64urlUnescape(str), 'base64').toString();
};

helpers.prototype.transformToScimFilter = function(filter) {
  // scimFilter each value
  async.map(filter, this.scimFilter, function(err, scimfilter) {
    arr = scimfilter
  })
  if(_.size(arr) > 1) {
    return arr.join(' and ')
  }
  else {
    return arr.join('')
  }
};

helpers.prototype.scimFilter = function(str, cb) {
  cb(null, encodeURIComponent(str))
}

helpers.prototype.scimSchema = function() {
  return ["urn:scim:schemas:core:1.0"]
}

helpers.prototype.prepareForScimUpdate = function(items) {

  var scimObj = {}
  _.map(items, function(val, field) {
    switch(field) {
      case 'firstname':
        scimObj.givenName = val;
        break
      case 'lastname':
        scimObj.familyName = val;
        break
      case 'username':
        scimObj.userName = val
        break
      case 'phonenumber':
        scimObj.phoneNumbers = val
        break
      case 'emails':
        scimObj.emails = val
        break
      case 'authorities':
        scimObj.authorities = val
        break
      case 'name':
        scimObj.name = val
        break
    }
  })
  return scimObj
}

helpers.prototype.pushToArray = function(arr, key) {
  var items = []
  var obj = {}
  _.each(arr, function(item) {
    obj[key] = item
    items.push(obj)
  })
  return items
}

/**
 * return the array item that contains a specific
 * string
 */ 
helpers.prototype.findStrVal = function(str, regex, separator) {
  //var arr = _.isString(items) ? items.split(';') : items
  var arr = str.split(separator)
  var val = _.find(arr, function(item) {
    return item.match(regex)
  })
  return val
}

helpers.prototype.newErr = function() {
  var args = arguments
  var body = args[0]
  var statusCode = args[1]
  var err = new Error(body)
  err.statusCode = statusCode
  return err
};

helpers.prototype.findByUniqueItem = function(arr, kv) {
  return _.where(arr, kv)
};

/**
 * Validates email dns provider
 */ 
helpers.prototype.lookupEmailDns = function(emails, fn) {
  console.log("Looking up email dns")
  function stripDomain(item, cb) {
    var val = item.split('@')[1]
    cb(null, val)
  }
  async.map(emails, stripDomain, function(err, results) {
    if (err) return fn(err)
    domains = results
  })
  console.log("domains", domains)
  var dns = Promise.promisifyAll(require('dns'));
  return dns.lookupAsync(domains.join())
  .then(function(val) { return fn(null, val) })
  .catch(function(err) {
    console.log("err. Invalid email domain", err)
    return fn(err)
  })
};

helpers.prototype.isValidEmailDomain = function(email) {
  var lookupDns = Promise.promisify(this.lookupEmailDns)
  lookupDns([email]).then(function(result) {
    console.log("result", result)
    return true
  })
  .catch(function(e) {
    if (e) return false
  })
};

helpers.prototype.htmlEncode = function(str, val) {
  text = val ? val : str
  return '<a href="' + str + '">' + text + "</a>"
}

exports = module.exports = {}
exports.helpers = new helpers();
