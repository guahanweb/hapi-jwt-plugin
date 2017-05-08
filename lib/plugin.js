'use strict';

const pjson = require('../package.json');

exports.register = function (server, options, next) {
    if (process.env.NODE_ENV === 'testing') {
        server.expose('foo', 'bar');
    }
    next();
};

exports.register.attributes = {
    name: pjson.name
};
