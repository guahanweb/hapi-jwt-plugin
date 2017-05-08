'use strict';

const chai = require('chai');
const expect = chai.expect;
const Server = require('./lib/server');
const pjson = require('../package.json');

describe('Hapi JWT Plugin', function () {
  it ('should initialize Hapi server', function (done) {
    Server.initializeServer().then(server => {
      expect(server.plugins[pjson.name]).to.exist;
      expect(server.plugins[pjson.name].foo).to.exist;
      expect(server.plugins[pjson.name].foo).to.equal('bar');
      done();
    }, err => {
      console.error(err);
      done(err);
    });
  });
});
