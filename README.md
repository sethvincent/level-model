# level-model

A higher-level module for creating content models using [leveldb](http://npmjs.org/level).

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/level-model.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/level-model
[travis-image]: https://img.shields.io/travis/sethvincent/level-model.svg?style=flat-square
[travis-url]: https://travis-ci.org/sethvincent/level-model
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CONDUCT.md

## About

level-model is a wrapper around [leveldb](https://npmjs.org/level) that provides validation and indexing.

Validation is provided using the [is-my-json-valid](http://npmjs.org/is-my-json-valid) module.

Indexing is achieved using the [level-simple-indexes](https://npmjs.org/level-simple-indexes) module, which in turn relies on [level-indexer](https://www.npmjs.com/package/level-indexer).

## Install

```sh
npm install --save level-model
```

## Usage

```js
var level = require('level')
var Model = require('level-model')
var db = level('db')

var posts = Model(db, {
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

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Conduct

It is important that this project contributes to a friendly, safe, and welcoming environment for all. Read this project's [code of conduct](CONDUCT.md)

## Changelog

Read about the changes to this project in [CHANGELOG.md](CHANGELOG.md). The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

# API

### Create a model by calling the function exported from `level-model`

### `var posts = Model(db, options)`

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

Add `beforeCreate` and `beforeUpdate` methods to `options.hooks` to format data before it is saved to the db:

```
var posts = Model(db, {
  modelName: 'posts',
  hooks: {
    beforeCreate: function (data) {
      data.slug = slugify(data.title)
      return data
    },
    beforeUpdate: function (data) {
      return data
    }
  }
})
```

## Events

### `example.on('create', function (model) {})`

### `example.on('update', function (model) {})`

### `example.on('delete', function () {})`

## Contact

- **issues** – Please open issues in the [issues queue](https://github.com/sethvincent/level-model/issues)
- **twitter** – Have a question? [@sethdvincent](https://twitter.com/sethdvincent)
- **email** – Need in-depth support via paid contract? Send an email to sethvincent@gmail.com

## License

[ISC](LICENSE.md)
