const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');


// BlogPosts.create('How to feed cows', 'Blog Content', 'John Legend', 'April 11, 2018');
// BlogPosts.create('When to eat chicken', 'Blog Content', 'John Wick', 'April 11, 2018');
// BlogPosts.create('Where to find pigs', 'Blog Content', 'John Appleseed', 'April 11, 2018');


router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
    // ensure `name` and `budget` are in request body
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
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

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
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

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted blog post id: \`${req.params.ID}\``);
    res.status(204).end();
});


module.exports = router;