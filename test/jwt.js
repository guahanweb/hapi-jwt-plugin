'use strict';

const JWT = require('../lib/jwt');
const chai = require('chai');
const expect = chai.expect;

describe ('JWT object', function () {
  it ('.constructor()', function () {
    let secret = 'my secret';
    let jwt = new JWT();
    expect(jwt.secret).to.equal('');

    jwt = new JWT({ secret: secret });
    expect(jwt.secret).to.equal(secret);
  });

  it ('.createToken()', function (done) {
    let jwt = new JWT({ secret: 'foobar' });
    jwt.header = { typ: 'jwt', alg: 'sha256' };
    jwt.payload = { foo: 'bar' };
    jwt.createToken().then(function (token) {
      console.log('TOKEN:', token);
      done();
    }, function (err) {
      done(err);
    });
  });

  it ('.validate()', function (done) {
    let jwt = new JWT();
    let header = {
      typ: 'jwt',
      alg: 'sha256'
    };

    let payload = {
      foo: 'bar'
    };

    // build a control token to test
    let token = [
      (new Buffer(JSON.stringify(header))).toString('base64'),
      (new Buffer(JSON.stringify(payload))).toString('base64'),
      'asdf'
    ].join('.');

    jwt.validate(token).then(function () {
      // check header parsing
      expect(jwt.header).to.exist;
      expect(jwt.header.typ).to.equal(header.typ);
      expect(jwt.header.alg).to.equal(header.alg);

      // check body parsing
      expect(jwt.payload).to.exist;
      expect(jwt.payload.foo).to.equal(payload.foo);

      done();
    }, function (err) {
      done(err);
    });
  });
});
