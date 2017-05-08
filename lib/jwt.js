'use strict';

const crypto = require('crypto');
const Promise = require('bluebird');

function JWT(opts) {
  this.secret = '';

  if (!!opts) {
    this.secret = opts.secret || '';
  }
}

JWT.prototype.createToken = function () {
  let jwt = this;
  return new Promise((resolve, reject) => {
    if (!jwt.header || !jwt.header.alg) {
      return reject('no encryption algorithm specified');
    }

    try {
      let header = (new Buffer(JSON.stringify(jwt.header))).toString('base64');
      let payload = (new Buffer(JSON.stringify(jwt.payload))).toString('base64');

      let hash = crypto.createHmac(jwt.header.alg, jwt.secret)
        .update(header + '.' + payload)
        .digest('hex');

      resolve(header + '.' + payload + '.' + hash);
    } catch (e) {
      return reject(e);
    }
  });
};

JWT.prototype.validate = function (token) {
  let jwt = this;
  return new Promise((resolve, reject) => {
    let parts = token.split('.');
    if (parts.length !== 3) {
      return reject('invalid token');
    }

    try {
      let header = parts[0];
      let payload = parts[1];
      let signature = parts[2];

      jwt.header = JSON.parse(Buffer.from(header, 'base64'));
      jwt.payload = JSON.parse(Buffer.from(payload, 'base64'));
      return resolve();
    } catch (e) {
      return reject('invalid token');
    }
  });
};

module.exports = JWT;
