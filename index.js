var Emitter = require('component-emitter')
var filter = require('filter-object-stream')
var filterObject = require('filter-object')
var validator = require('is-my-json-valid')
var indexer = require('level-simple-indexes')
var defaults = require('json-schema-defaults')
var sublevel = require('subleveldown')
var through = require('through2')
var extend = require('extend')
var cuid = require('cuid')
var partial = require('ap').partial

function identity (n) { return n }

module.exports = LevelModel

function LevelModel (db, opts) {
  opts.hooks = opts.hooks || {}

  var emitter = new Emitter()
  var self = {}

  self.on = emitter.on.bind(emitter)
  self.emit = emitter.emit.bind(emitter)
  self.modelName = opts.modelName
  self.db = sublevel(db, self.modelName, { valueEncoding: 'json' })
  self.timestamps = opts.timestamps === undefined ? true : opts.timestamps
  self.timestamp = opts.timestamp || function () { return new Date(Date.now()).toISOString() }
  self.indexKeys = opts.indexKeys || []
  self.validateOpts = opts.validateOpts
  self.hooks = {
    beforeCreate: opts.hooks.beforeCreate || identity,
    beforeUpdate: opts.hooks.beforeUpdate || identity
  }

  self.schema = createSchema()
  self.validate = validator(self.schema, opts.validateOpts)
  self.indexDB = sublevel(db, self.modelName + '-index')
  self.indexer = indexer(self.indexDB, opts.indexOpts || {
    properties: self.indexKeys,
    keys: true,
    values: true,
    map: function map (key, callback) {
      self.get(key, function (err, val) {
        callback(err, val)
      })
    }
  })

  self.create = partial(create, self)
  self.get = partial(get, self)
  self.put = self.save = partial(put, self)
  self.update = partial(update, self)
  self.del = self.delete = partial(del, self)
  self.find = self.createFindStream = partial(find, self)
  self.findOne = partial(findOne, self)
  self.createReadStream = partial(createReadStream, self)
  self.createFilterStream = partial(createFilterStream, self)

  return self

  function createSchema () {
    var schema = filterObject(opts, ['*', '!modelName', '!timestamp', '!indexKeys', '!validateOpts', '!prefix'])

    schema = extend({
      title: self.modelName,
      type: 'object'
    }, schema)

    schema.properties.key = {
      type: 'string'
    }

    if (self.timestamps) {
      schema.properties.created = {
        type: ['string', 'null'],
        default: null
      }
      schema.properties.updated = {
        type: ['string', 'null'],
        default: null
      }
    }

    schema.required = schema.required || []
    if (schema.required.indexOf('key') < 0) {
      schema.required = schema.required.concat('key')
    }

    return schema
  }
}

function create (self, data, callback) {
  var key = data.key ? data.key : cuid()
  if (!data.key) data.key = key
  data = self.hooks.beforeCreate(data)
  data = extend(defaults(self.schema), data)
  var validated = self.validate(data)
  if (!validated) return callback(new Error(JSON.stringify(self.validate.errors)))

  if (self.timestamps) {
    data.created = self.timestamp()
    data.updated = null
  }
  self.db.put(key, data, function (err) {
    if (err) return callback(err)

    self.indexer.addIndexes(data, function () {
      self.emit('create', data)
      callback(null, data)
    })
  })
}

function get (self, key, options, callback) {
  self.db.get(key, options, callback)
}

function put (self, key, data, callback) {
  if (typeof key === 'object') {
    callback = data
    data = key
    key = data.key
  }

  if (!key) return create(data, callback)
  return update(key, data, callback)
}

function update (self, key, data, callback) {
  if (typeof key === 'object') {
    callback = data
    data = key
    key = data.key
  }

  self.get(key, function (err, model) {
    if (err || !model) return callback(new Error(self.modelName + ' not found with key ' + key))
    model = extend(model, data)
    if (self.timestamps) model.updated = self.timestamp()
    model = self.hooks.beforeUpdate(model)

    var validated = self.validate(model)
    if (!validated) return callback(new Error(JSON.stringify(self.validate.errors)))

    self.indexer.updateIndexes(model, function () {
      self.db.put(key, model, function (err) {
        self.emit('update', model)
        callback(err, model)
      })
    })
  })
}

function del (self, key, callback) {
  self.get(key, function (err, data) {
    if (err || !data) return callback(err)
    self.indexer.removeIndexes(data, function () {
      self.emit('delete', data)
      self.db.del(key, callback)
    })
  })
}

function createReadStream (self, options) {
  return self.db.createReadStream(options)
}

function find (self, index, options) {
  return self.indexer.find(index, options)
}

function findOne (self, index, options, callback) {
  self.indexer.findOne(index, options, function (err, model) {
    if (err) return callback(err)
    if (!model) return callback(new Error('[NotFoundError: model not found with ' + index + ' ' + options + ']'))
    return callback(null, model)
  })
}

function createFilterStream (self, options) {
  options = options || {}
  if (!options.query) options = { query: options }
  return createReadStream(options).pipe(through.obj(filter(options.query)))
}
