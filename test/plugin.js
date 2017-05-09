'use strict';

const chai = require('chai');
const expect = chai.expect;
const Server = require('./lib/server');
const pjson = require('../package.json');
const JWT = require('../lib/jwt');

const options = {
  secret: 'my secret',
  alg: 'sha256',
  typ: 'jwt'
};

describe('Hapi JWT Plugin', function () {
  before(function (done) {
    let context = this;
    Server.initializeServer(options).then(server => {
      context.server = server;
      done();
    }, done);
  });

  it ('should initialize Hapi server', function () {
    expect(this.server.plugins[pjson.name]).to.exist;
    expect(this.server.plugins[pjson.name].jwt).to.exist;
    expect(this.server.plugins[pjson.name].jwt.secret).to.equal(options.secret);
  });

  it ('should require authorization header', function (done) {
    this.server.inject({ url: '/test' }, res => {
      let payload = JSON.parse(res.payload);
      expect(res.statusCode).to.equal(401);
      expect(payload.message).to.equal('Missing authentication');
      done();
    });
  });

  it ('should reject malformed bearer payload', function (done) {
    this.server.inject({ url: '/test', headers: { authorization: 'Bearer' } }, res => {
      let payload = JSON.parse(res.payload);
      expect(res.statusCode).to.equal(400);
      expect(payload.message).to.equal('Bad HTTP authentication header format');
      done();
    });
  });

  it ('should reject malformed JWT token', function (done) {
    this.server.inject({ url: '/test', headers: { authorization: 'Bearer asdf' } }, res => {
      let payload = JSON.parse(res.payload);
      expect(res.statusCode).to.equal(400);
      expect(payload.message).to.equal('Invalid or malformed auth token');
      done();
    });
  });

  it ('should reject invalid JWT token', function (done) {
    // change the secret
    let jwt = new JWT({ secret: 'different secret', alg: 'sha256', typ: 'jwt' });
    let token = jwt.getToken({ foo: 'bar' });

    this.server.inject({ url: '/test', headers: { authorization: 'Bearer ' + token } }, res => {
      let payload = JSON.parse(res.payload);
      expect(res.statusCode).to.equal(401);
      expect(payload.message).to.equal('Invalid auth token');
      done();
    });
  });

  it ('should authorize a valid JWT token', function (done) {
    let jwt = new JWT(options);
    let token = jwt.getToken({ foo: 'bar' });

    this.server.inject({ url: '/test', headers: { authorization: 'Bearer ' + token } }, res => {
      expect(res.statusCode).to.equal(200);
      expect(res.payload).to.equal('ok');
      done();
    });
  });
});
