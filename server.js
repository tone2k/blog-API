
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
app.use(morgan('common'));

// we're going to add some items to ShoppingList
// so there's some data to look at
BlogPosts.create('How to feed cows', 'John Legend', 'Blog Content');
BlogPosts.create('When to eat chicken', 'John Wick', 'Blog Content');
BlogPosts.create('Where to find pigs', 'John Appleseed', 'Blog Content');

// when the root of this router is called with GET, return
// all current ShoppingList items
app.get('/blogpost', (req, res) => {
  res.json(BlogPosts.get());
});

app.post('/blogpost', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const blog = BlogPosts.create(req.body.name, req.body.budget);
  res.status(201).json(blog);
});

// when PUT request comes in with updated item, ensure has
// required fields. also ensure that item id in url path, and
// item id in updated item object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `ShoppingList.update` with updated item.
app.put('/blogpost/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog id: \`${req.params.id}\``);
  BlogPosts.update({
    title: req.params.title,
    author: req.body.author,
    content: req.body.content
  });
  res.status(204).end();
});


// when DELETE request comes in with an id in path,
// try to delete that item from ShoppingList.
app.delete('/blogpost/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post id: \`${req.params.ID}\``);
  res.status(204).end();
});


app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
