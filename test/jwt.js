'use strict';

const JWT = require('../lib/jwt');
const chai = require('chai');
const expect = chai.expect;

const payload = { foo: 'bar' };

describe ('JWT object', function () {
  before(function () {
    let jwt = new JWT({
      secret: 'foobar',
      typ: 'jwt',
      alg: 'sha256'
    });

    this.control = jwt;
  });

  it ('.constructor()', function () {
    let secret = 'my secret';
    let jwt = new JWT();
    expect(jwt.secret).to.equal('');

    jwt = new JWT({ secret: secret });
    expect(jwt.secret).to.equal(secret);
  });

  it ('.getToken()', function () {
    expect(typeof this.control.getToken).to.equal('function');
    let token = this.control.getToken(payload);
    expect(typeof token).to.equal('string');
    let parts = token.split('.');
    expect(parts.length).to.equal(3);
  });

  it ('.validate() - valid', function (done) {
    let jwt = new JWT({ secret: 'foobar' });
    let control = this.control;
    let token = control.getToken(payload);

    // validate with our new JWT object
    jwt.validate(token).then(function () {
      // check header parsing
      expect(jwt.header).to.exist;
      expect(jwt.header.typ).to.equal(control.typ);
      expect(jwt.header.alg).to.equal(control.alg);

      // check body parsing
      expect(jwt.payload).to.exist;
      expect(jwt.payload.foo).to.equal(payload.foo);

      done();
    }, done);
  });

  it ('.validate() - invalid', function (done) {
    let jwt = new JWT({ secret: 'fizzbuzz' });
    let token = this.control.getToken(payload);

    jwt.validate(token).then(function () {
      done(new Error('should not validate'));
    }, function (err) {
      expect(err).to.exist;
      expect(err).to.equal('invalid token');
      done();
    });
  });
});
