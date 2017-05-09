'use strict';

const pjson = require('../package.json');
const JWT = require('./jwt');

exports.register = function (server, options, next) {
    server.register(require('./auth'), err => {
        if (err) {
            return next(err);
        }

        let secret = (!!options && !!options.secret) ? options.secret : null;
        if (null === secret) throw new Error('JWT plugin requires a secret to be configured');

        let jwt = new JWT({ secret: secret });

        server.auth.strategy('jwt', 'jwt', false, {
            jwt: options,
            validateFunc: (request, token, cb) => {
                cb(null, true, {});
            }
        });

        if (process.env.NODE_ENV === 'testing') {
            server.expose('jwt', jwt);
        }

        next();
    });
};

exports.register.attributes = {
    name: pjson.name
};
