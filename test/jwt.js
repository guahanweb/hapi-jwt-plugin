'use strict';

const JWT = require('../lib/jwt');
const chai = require('chai');
const expect = chai.expect;

describe ('JWT object', function () {
  before(function () {
    let jwt = new JWT({ secret: 'foobar' });
    jwt.header = { typ: 'jwt', alg: 'sha256' };
    jwt.payload = { foo: 'bar' };
    this.control = jwt;
  });

  it ('.constructor()', function () {
    let secret = 'my secret';
    let jwt = new JWT();
    expect(jwt.secret).to.equal('');

    jwt = new JWT({ secret: secret });
    expect(jwt.secret).to.equal(secret);
  });

  it ('.createToken()', function (done) {
    this.control.createToken().then(function (token) {
      done();
    }, function (err) {
      done(err);
    });
  });

  it ('.validate() - valid', function (done) {
    let jwt = new JWT({ secret: 'foobar' });
    let control = this.control;

    // build a control token to test
    control.createToken().then(token => {
      // validate with our new JWT object
      jwt.validate(token).then(function () {
        // check header parsing
        expect(jwt.header).to.exist;
        expect(jwt.header.typ).to.equal(control.header.typ);
        expect(jwt.header.alg).to.equal(control.header.alg);

        // check body parsing
        expect(jwt.payload).to.exist;
        expect(jwt.payload.foo).to.equal(control.payload.foo);

        done();
      }, done);
    }, done);
  });

  it ('.validate() - invalid', function (done) {
    let jwt = new JWT({ secret: 'fizzbuzz' });
    let control = this.control;

    // build a control token to test
    control.createToken().then(token => {
      jwt.validate(token).then(function () {
        done(new Error('should not validate'));
      }, function (err) {
        expect(err).to.exist;
        expect(err).to.equal('invalid token');
        done();
      });

    }, done);
  });
});
