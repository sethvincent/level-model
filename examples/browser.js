var level = require('level-browserify')
var Model = require('../index')
var inherits = require('inherits')
var db = level('example-db')

function Posts (db, opts) {
  Model.call(this, db, opts)
}

inherits(Posts, Model)

var posts = new Posts(db, {
  modelName: 'example',
  indexKeys: ['test', 'ok'],
  properties: {
    title: { type: 'string' },
    content: { type: 'string' }
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
