'use strict';

const Hapi = require('hapi');
const Promise = require('bluebird');
const server = new Hapi.Server();

module.exports = {
    initializeServer: initializeServer
};

function initializeServer(options) {
    return new Promise((resolve, reject) => {
        let server = new Hapi.Server();
        // auto-map port for tests (any open port will do)
        server.connection({ port: 0 });
        server.register({
            register: require('../../lib/plugin'),
            options: options
        }, err => {
            if (err) {
                return reject(err);
            }

            server.route({
              method: 'GET',
              path: '/test',
              config: {
                auth: 'jwt',
                handler: function (request, reply) {
                  reply('ok');
                }
              }
            });

            server.start(err => {
                if (err) {
                    return reject(err);
                }

                resolve(server);
            });
        });
    });
}
