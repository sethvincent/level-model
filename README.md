# level-model

A higher-level module for creating content models using [levelup](http://npmjs.org/levelup) as db and [is-my-json-valid](http://npmjs.org/is-my-json-valid) for validation.

## Example

```
var level = require('level')
var Model = require('level-model')
var inherits = require('util').inherits
var db = level('db')

function Posts (db, opts) {
  Model.call(this, db, opts)
}

inherits(Posts, Model)

var posts = new Posts(db, {
  modelName: 'example',
  indexKeys: ['test', 'ok'],
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
  },
  required: ['title']
})

var data = {
  title: 'first post!',
  content: 'this is some text.'
}

posts.create(data, function (err, post) {
  console.log(err, post)
})
```

## API

### Create a model that inherits from level-model

```
var Model = require('level-model')
var inherits = require('util').inherits

function Posts (db, options) {
  Model.call(this, db, options)
}

inherits(Posts, Model)
```

### `var posts = new Posts(db, options)`

Options:

```js
{
  modelName: 'Example',
  indexKeys: [],
  properties: {},
  required: []
}
```

The options object can accept anything that [json-schema](http://json-schema.org) accepts.

### `posts.create(data, callback)`

### `posts.get(key, options, callback)`

### `posts.update(key, data, callback)`

### `posts.delete(key, callback)`

### `posts.createReadStream(options)`

### `posts.find(index, options)`

## Format data before create & update

Override level-model's `beforeCreate` and `beforeUpdate` methods to format data before it is saved to the db:

```
function Posts (db, options) {
  Model.call(this, db, options)
}

Posts.prototype.beforeCreate = function (data) {
  data.slug = slugify(data.title)
  return data
}

Posts.prototype.beforeUpdate = function (data) {
  return data
}
```

## Events

### `example.on('create', function (model) {})`

### `example.on('update', function (model) {})`

### `example.on('delete', function () {})`

## License

MIT