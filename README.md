# level-model

A higher-level module for creating content models using levelup as db.

## Example

```
var Model = require('level-model')
var inherits = require('util').inherits

function Posts (db, opts) {
  Model.call(this, db, opts)
}

inherits(Posts, Model)

var posts = new Posts(db, {
  modelName: 'example',
  indexKeys: ['test', 'ok'],
  schema: {
    title: "Example",
    type: "object",
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
    },
    required: ['title']
  }
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

function Posts (db, opts) {
  Model.call(this, db, opts)
}

inherits(Posts, Model)
```

### `var posts = new Posts(db, opts)`

Options:

```js
{
  modelName: '',
  indexKeys: [],
  schema: {
    title: "Example",
    type: "object",
    properties: {},
    required: []
  }
}
```

### `posts.create(data, callback)`

### `posts.get(key, options, callback)`

### `posts.update(key, data, callback)`

### `posts.delete(key, callback)`

### `posts.createReadStream(options)`

### `posts.find(index, options)`

## Events

### `example.on('create', function (model) {})`

### `example.on('update', function (model) {})`

### `example.on('delete', function () {})`

## License

MIT