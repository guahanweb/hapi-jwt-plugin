'use strict';

const crypto = require('crypto');
const Promise = require('bluebird');

function JWT(opts) {
  this.secret = '';

  if (!!opts) {
    this.secret = opts.secret || '';
    this.alg = opts.alg || 'sha256';
    this.typ = opts.typ || 'jwt';
  }
}

JWT.prototype.getToken = function (data) {
  this.data = data || {};
  return getToken({ typ: this.typ, alg: this.alg }, this.data, this.secret);
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
      let hash = getHash(header, payload, jwt.header.alg, jwt.secret);

      if (signature === hash) {
        return resolve();
      }

      return reject('invalid token');
    } catch (e) {
      return reject('invalid token');
    }
  });
};

function getToken(header, payload, secret) {
  let algorithm = header.alg;
  header = typeof header == 'object' ? (new Buffer(JSON.stringify(header))).toString('base64') : header.toString();
  payload = typeof payload == 'object' ? (new Buffer(JSON.stringify(payload))).toString('base64') : payload.toString();
  return header + '.' + payload + '.' + getHash(header, payload, algorithm, secret);
}

function getHash(header, payload, algorithm, secret) {
  header = typeof header == 'object' ? (new Buffer(JSON.stringify(header))).toString('base64') : header.toString();
  payload = typeof payload == 'object' ? (new Buffer(JSON.stringify(payload))).toString('base64') : payload.toString();

  return crypto.createHmac(algorithm, secret)
    .update(header + '.' + payload)
    .digest('hex');
}

module.exports = JWT;
