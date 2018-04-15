const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Blog Post', function () {

    before(function () {
        return runServer();
    });

    after(function () {
        return closeServer();
    });

    it('should list items on GET', function () {

        return chai.request(app)
            .get('/blogpost')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');

                // because we create three items on app load
                expect(res.body.length).to.be.at.least(1);
                // each item should be an object with key/value pairs
                // for `id`, `name` and `checked`.
                const expectedKeys = ['id', 'title', 'content', 'author'];
                res.body.forEach(function (item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    // test strategy:
    //  1. make a POST request with data for a new item
    //  2. inspect response object and prove it has right
    //  status code and that the returned object has an `id`
    it('should add an item on POST', function () {
        const newItem = {
            title: 'Hello Penguin',
            content: 'Penguins are always dressed nicely',
            author: 'Penguin'
        };
        return chai.request(app)
            .post('/blogpost')
            .send(newItem)
            .then(function (res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('id', 'title', 'content', 'author');
                expect(res.body.id).to.not.equal(null);
                // response should be deep equal to `newItem` from above if we assign
                // `id` to it from `res.body.id`
                expect(res.body).to.deep.equal(Object.assign(newItem, {
                    id: res.body.id
                }));
            });
    });

    // test strategy:
    //  1. initialize some update data (we won't have an `id` yet)
    //  2. make a GET request so we can get an item to update
    //  3. add the `id` to `updateData`
    //  4. Make a PUT request with `updateData`
    //  5. Inspect the response object to ensure it
    //  has right status code and that we get back an updated
    //  item with the right data in it.
    it('should update blog on PUT', function () {
        // we initialize our updateData here and then after the initial
        // request to the app, we update it with an `id` property so
        // we can make a second, PUT call to the app.
        const updateData = {
            title: 'Hello Penguins',
            content: 'Penguins are always dressed wonderfully',
            author: 'Golden Penguin'
        };

        return chai.request(app)
            // first have to get so we have an idea of object to update
            .get('/blogpost')
            .then(function (res) {
                updateData.id = res.body[0].id;
                // this will return a promise whose value will be the response
                // object, which we can inspect in the next `then` block. Note
                // that we could have used a nested callback here instead of
                // returning a promise and chaining with `then`, but we find
                // this approach cleaner and easier to read and reason about.
                return chai.request(app)
                    .put(`/blogpost/${updateData.id}`)
                    .send(updateData)
                    // prove that the PUT request has right status code
                    // and returns updated item
                    .then(function (res) {
                        console.log("body", res.body);
                        expect(res).to.have.status(200);
                        expect(res).to.be.json;
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.deep.equal(updateData);
                    });
            });
    });

    // test strategy:
    //  1. GET shopping list items so we can get ID of one
    //  to delete.
    //  2. DELETE an item and ensure we get back a status 204
    it('should delete blog post on DELETE', function () {
        return chai.request(app)
            // first have to get so we have an `id` of item
            // to delete
            .get('/blogpost')
            .then(function (res) {
                return chai.request(app)
                    .delete(`/blogpost/${res.body[0].id}`);
            })
            .then(function (res) {
                expect(res).to.have.status(204);
            });
    });
});