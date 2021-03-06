var test = require('tape')
var through = require('through2')
var Model = require('../')

var db = require('memdb')()

var example = Model(db, {
  modelName: 'example',
  properties: {
    key: { type: 'string' },
    test: { type: 'string' },
    ok: { type: 'integer' }
  },
  indexKeys: ['test', 'ok'],
  required: ['test']
})

test('model exists', function (t) {
  t.ok(example, 'example model exists')
  t.ok(example.schema, 'schema of example model exists')
  t.end()
})

test('create a model', function (t) {
  var data = {
    test: 'first instance!',
    ok: 1
  }

  example.create(data, function (err, instance) {
    t.ifError(err, 'no error')
    t.ok(instance, 'instance of model exists')
    t.ok(instance.key, 'has a key')
    t.end()
  })
})

test('get a model', function (t) {
  var data = {
    test: 'second instance!',
    ok: 2
  }

  example.create(data, function (err, instance) {
    t.notOk(err)

    example.get(instance.key, function (err, retrieved) {
      t.ifError(err, 'no error')
      t.ok(retrieved, 'instance of model exists')
      t.ok(retrieved.key, 'has a key')
      t.end()
    })
  })
})

test('update a model', function (t) {
  var data = {
    test: 'third instance!',
    ok: 3
  }

  example.create(data, function (err, instance) {
    t.notOk(err)
    instance.ok = 2

    example.update(instance, function (err, updated) {
      t.ifError(err, 'no error')
      t.equals(updated.ok, 2)
      t.end()
    })
  })
})

test('update a model with partial data', function (t) {
  var data = {
    test: 'another instance!',
    ok: 5
  }

  example.create(data, function (err, instance) {
    t.notOk(err)

    example.update(instance.key, { ok: 6 }, function (err, updated) {
      t.notOk(err)
      t.equal(updated.ok, 6)
      t.end()
    })
  })
})

test('reject model creation if it doesnt fit the schema', function (t) {
  var data = {
    test: 'huh',
    ok: 'oops' // should be an integer
  }

  example.create(data, function (err, instance) {
    t.ok(err, 'error saying the object does not match the schema')
    t.notOk(instance, 'instance of model not created')
    t.end()
  })
})

test('list models', function (t) {
  var count = 0

  function iterator (item, enc, next) {
    count++
    next()
  }

  function end () {
    t.equals(count, 4)
    t.end()
  }

  example.createReadStream().pipe(through.obj(iterator, end))
})

test('find models by indexed key', function (t) {
  t.plan(3)
  var count = 0

  function iterator (item, enc, next) {
    t.ok(item)
    count++
    next()
  }

  function end () {
    t.equal(count, 2)
  }

  example.find('ok', 2).pipe(through.obj(iterator, end))
})

test('create, update, delete events', function (t) {
  var data = {
    test: 'fourth instance!',
    ok: 4
  }

  example.on('create', function (model) {
    t.ok(model)
  })

  example.on('update', function (model) {
    t.ok('model')
  })

  example.on('delete', function () {
    t.ok(true)
  })

  example.create(data, function (err, instance) {
    t.notOk(err)
    instance.ok = 2

    example.update(instance, function (err, updated) {
      t.ifError(err, 'no error')
      t.equals(updated.ok, 2)
      t.end()
    })
  })
})

test('delete models', function (t) {
  example.createReadStream()
    .on('data', function (data) {
      example.delete(data.key, function (err) {
        t.ifError(err, 'no error')
      })
    })
    .on('end', function () {
      t.end()
    })
})

test('create lock', function (t) {
  t.plan(6)
  example.create({ key: 'create', test: '1' }, (err, model) => {
    t.notOk(err)
    t.ok(model)
  })

  example.create({ key: 'create', test: '2' }, (err, model) => {
    t.ok(err)
    t.notOk(model)
  })

  example.create({ key: 'create', test: '3' }, (err, model) => {
    t.ok(err)
    t.notOk(model)
  })
})

test('update lock', function (t) {
  t.plan(10)
  example.create({ key: 'update', test: '1' }, (err, model) => {
    t.notOk(err)
    t.ok(model)

    example.update({ key: 'update', test: '4' }, (err, model) => {
      t.notOk(err)
      t.ok(model)
      t.ok(model.test === '4')
      t.ok(model.updated)
    })
  })

  example.update({ key: 'update', test: '2' }, (err, model) => {
    t.ok(err)
    t.notOk(model)
  })

  example.update({ key: 'update', test: '3' }, (err, model) => {
    t.ok(err)
    t.notOk(model)
  })
})

test('delete lock', function (t) {
  t.plan(7)

  example.create({ key: 'delete', test: '1' }, (err, model) => {
    t.notOk(err)
    t.ok(model)

    example.delete('delete', (err) => {
      t.notOk(err)
    })

    example.create({ key: 'delete', test: '2' }, (err, model) => {
      t.ok(err)
      t.notOk(model)
    })

    example.update({ key: 'delete', test: '3' }, (err, model) => {
      t.ok(err)
      t.notOk(model)
    })
  })
})
