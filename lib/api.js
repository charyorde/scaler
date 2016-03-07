var app = require(__dirname + '/../server').app
var express = require(__dirname + '/../server').express
var router = express.Router()
var Scaler = require('./scaler')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var validator = require('express-validator')
var cors = require('cors')
var util = require('util')
  , multer = require('multer')
  , mustache = require('mustache')
  , fs = require('fs')
  , Promise = require('bluebird')
  , fsAsync = Promise.promisifyAll(fs)

router.options('*', cors());
router.use(cors());
router.use(cookieParser());

var jsonParser = bodyParser.json({ type: 'application/json' } );

var upload = multer({ dest: __dirname + '/../files' })

router.use(validator({
  customValidators: {
    isArray: function(value) {
      return Array.isArray(value)
    },
    isBoolean: function(val) {
      return _.isBoolean(val)
    },
    isObject: function(val) {
      return _.isObject(val)
    },
    isUrl: function(val) {
      return isUrl(val)
    },
  }
}));

// middleware to detect UA
router.use(function(req, res, next) {
  req.ua = req.headers["user-agent"]
  next()
})

router.get('/ping', function(req, res) {
  console.log('=== App loaded! ===')
  return res.status(200).send('App loaded!')
})

router.get('/', function(req, res) {
  var template = require('fs').readFileSync(__dirname + '/../views/index.mustache', 'utf8')
  var indexPage = mustache.render(template, {totalusers: 10, activeusers: 2})
  return res.send(indexPage)
})

/**
 * Service to upload spread sheet
 * ^1.1.0
 * @param email
 */ 
router.post('/upload-sheet', upload.single('filedata'), function(req, res, next) {
  console.log('"Uploading Sheet start time": %d, "UA": %s', new Date(), req.ua);
  if (!req.body) return res.sendStatus(400);
  // Only application/json and multipart/form-data is allowed
  if(!req.accepts('multipart/form-data')) {
    console.log("%s not supported", req.get('Content-Type'))
    return res.sendStatus(406);
  }
  
  var form = {
    body: req.body,
    files: req.file
  }
  var files = form.files
    , filedata = files

  console.log("Uploaded file metadata", util.inspect(form, {showHidden: false, depth: null}))

  fsAsync.statAsync(filedata.path)
  .then(function(stat) {
    if(stat.isFile()) {
      console.log("file exist:", stat.isFile())
      new Scaler(filedata.path)
      return res.status(200).send('OK')
    }
  })
  .catch(function(e) {
    console.log("err", e)
    return res.status(404).send(e)
  })
  /*if(require('fs').statSync(filedata.path).isFile()) {
    new Scaler(filedata.path)
    return res.status(200).send('OK')
  }
  else {
    return res.status(404).send(e)
  }*/
})

module.exports = router;
