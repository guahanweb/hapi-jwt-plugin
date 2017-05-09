'use strict';

const Boom = require('boom');
const Hoek = require('hoek');
const JWT = require('../jwt');

const internals = {};

exports.register = function (plugin, options, next) {
  plugin.auth.scheme('jwt', internals.implementation);
  next();
};

exports.register.attributes = {
  name: 'jwt-auth-strategy'
};

internals.implementation = function (server, options) {
  Hoek.assert(options, 'Missing jwt auth strategy options');
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function in jwt scheme');
  Hoek.assert(typeof options.jwt === 'object', 'options.jwt must be a valid config object in jwt scheme');

  const settings = Hoek.clone(options);
  const jwt = new JWT(options.jwt);

  const scheme = {
    authenticate: function (request, reply) {
      const req = request.raw.req;
      const authorization = req.headers.authorization;
      if (!authorization) {
        return reply(Boom.unauthorized(null, 'JWT', settings.unauthorizedAttributes));
      }

      const parts = authorization.split(/\s+/);

      if (parts[0].toLowerCase() !== 'bearer') {
        return reply(Boom.unauthorized(null, 'JWT', settings.unauthorizedAttributes));
      }

      if (parts.length !== 2) {
        return reply(Boom.badRequest('Bad HTTP authentication header format', 'JWT'));
      }

      // validate the JWT token here
      const token = parts[1];
      const token_parts = token.split('.');

      if (token_parts.length !== 3) {
        return reply(Boom.badRequest('Invalid or malformed auth token', 'JWT'));
      }

      jwt.validate(token).then(function () {
        settings.validateFunc(request, token, (err, isValid, credentials) => {
          if (!isValid) {
            return reply(Boom.unauthorized('Invalid auth token', 'JWT', settings.unauthorizedAttributes), null, { credentials: credentials });
          }

          // authorized
          return reply.continue({ credentials: credentials });
        });
      }, function (err) {
        return reply(Boom.unauthorized('Invalid auth token', 'JWT', settings.unauthorizedAttributes));
      });
    }
  };

  return scheme;
};
