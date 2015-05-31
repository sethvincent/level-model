var Emitter = require('component-emitter')
var inherits = require('inherits')
var filter = require('filter-object-stream')
var validator = require('is-my-json-valid')
var indexer = require('level-simple-indexes')
var sublevel = require('subleveldown')
var extend = require('extend')
var cuid = require('cuid')

module.exports = LevelModel
inherits(LevelModel, Emitter)

function LevelModel (db, opts) {
  if (!(this instanceof LevelModel)) return new LevelModel(db, opts)
  Emitter.call(this)
  var self = this
  this.modelName = opts.modelName || 'model'
  this.db = sublevel(db, this.modelName, { valueEncoding: 'json' })
  this.schema = opts.schema
  this.validate = validator(opts.schema, opts.validateOpts)
  this.timestamps = opts.timestamps || true
  this.timestamp = opts.timestamp || function () { return new Date(Date.now()).toISOString() }
  this.indexKeys = opts.indexKeys || []
  this.indexes = {}

  function map (key, callback) {
    self.get(key, function (err, val) {
      self.db.createReadStream().on('data', console.log)
      callback(err, val)
    })
  }

  var indexOpts = opts.indexOpts || {
    properties: this.indexKeys,
    keys: true,
    values: true,
    map: map
  }

  this.indexDB = sublevel(db, this.modelName + '-index')
  this.indexer = indexer(this.indexDB, indexOpts)
}

LevelModel.prototype.create = function (data, callback) {
  var self = this
  if (!data.key) var key = data.key = cuid()
  var validated = this.validate(data)

  if (!validated) {
    // TODO: more useful error message
    return callback(new Error(this.modelName + ' object does not match schema'))
  }

  if (this.timestamps) {
    data.created = this.timestamp()
    data.updated = null
  }

  this.db.put(key, data, function (err) {
    if (err) return callback(err)

    self.indexer.addIndexes(data, function () {
      self.emit('create', data)
      callback(null, data)
    })
  })
}

LevelModel.prototype.get = function (key, options, callback) {
  this.db.get(key, options, callback)
}

LevelModel.prototype.put =
LevelModel.prototype.save = function (key, data, callback) {
  if (typeof key === 'object') {
    callback = data
    data = key
    key = data.key
  }

  if (!key) return this.create(data, callback)
  return this.update(key, data, callback)
}

LevelModel.prototype.update = function (key, data, callback) {
  var self = this

  if (typeof key === 'object') {
    callback = data
    data = key
    key = data.key
  }

  this.get(key, function (err, model) {
    if (err || !model) return callback(new Error(self.modelName + ' not found with key ' + key))
    model = extend(model, data)
    if (self.timestamps) model.updated = self.timestamp()
    self.indexer.updateIndexes(model, function () {
      self.db.put(key, model, function (err) {
        self.emit('update', model)
        callback(err, model)
      })
    })
  })
}

LevelModel.prototype.del =
LevelModel.prototype.delete = function (key, callback) {
  var self = this
  this.get(key, function (err, data) {
    if (err || !data) return callback(err)
    self.indexer.removeIndexes(data, function () {
      self.emit('delete', data)
      self.db.del(key, callback)
    })
  })
}

LevelModel.prototype.createReadStream = function (options) {
  return this.db.createReadStream(options)
}

LevelModel.prototype.find =
LevelModel.prototype.createFindStream = function (index, options) {
  return this.indexer.find(index, options)
}

LevelModel.prototype.filter =
LevelModel.prototype.createFilterStream = function (options) {
  return this.createReadStream(options).pipe(filter(options.query))
}
