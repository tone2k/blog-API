const chai = require('chai');
const chaiHttp = require('chai-http');


const { app, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        })
            .on('error', err => {
                reject(err);
            });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

describe('Blogs', function () {
    // before(function () {
    //     return runServer();
    // });
    // after(function () {
    //     return closeServer();
});
it('should list Blog Post on GET', function () {
    return chai.request(app)
        .get('/blogpost')
        .then(function (res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.at.least(1);
            const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
            res.body.forEach(function (item) {
                expect(item).to.be.a('object');
                expect(item).to.include.keys(expectedKeys);
            });
        });
});
it('should add a Blog Post on POST', function () {
    const newItem = { title: 'Earth', content: 'The Earth is our home', author: 'Penguin', publishDate: 'Jan 20, 2018' };
    return chai.request(app)
        .post('/blogpost')
        .send(newItem)
        .then(function (res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'title', 'content', 'author', 'publishDate');
            expect(res.body.id).to.not.equal(null);
            expect(res.body).to.deep.equal(Object.assign(newItem, { id: res.body.id }));
        });
});
it('should update Blog Post on PUT', function () {
    const updateData = {
        title: 'Our Home',
        content: 'The Earth has always been our home',
        author: 'Penguin',
        publishDate: 'Jan 22, 2018'
    };
    return chai.request(app)
        .get('/blogpost')
        .then(function (res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/blogpost/${updateData.id}`)
                .send(updateData)
        })
        .then(function (res) {
            expect(res).to.have.status(204);
        });
});

it('should delete Blog Post on DELETE', function () {
    return chai.request(app)
        .get('/blogpost')
        .then(function (res) {
            return chai.request(app)
                .delete(`/blogpost/${res.body[0].id}`);
        })
        .then(function (res) {
            expect(res).to.have.status(204);
        });
});