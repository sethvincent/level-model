var level = require('level-browserify')
var Model = require('../index')
var db = level('example-db')

var posts = Model(db, {
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
