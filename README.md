# JWT Plugin for Hapi
[![Build Status](https://travis-ci.org/guahanweb/hapi-jwt-plugin.svg?branch=master)](https://travis-ci.org/guahanweb/hapi-jwt-plugin)

[JavaScript Web Tokens](https://jwt.io/) provide an RFC compliant way to propogate data through requests.
This plugin leverages Hapi's authorization model and creates a customizable way to validate inbound
authorization headers using JWT.

## Usage
Install and save your dependency:

```sh
$ npm i -S @guahanweb/hapi-jwt-plugin
```

The easiest way to leverage validation is to use the included authorization scheme in your routes:

```javascript
const Hapi = require('hapi');
const server = new Hapi.Server();

server.connection({ port: 3000 });
server.register({
  register: require('@guahanweb/hapi-jwt-plugin'),
  options: {
    secret: 'my app secret',
    typ: 'jwt',
    alg: 'sha256'
  }
}, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  server.route({
    method: 'GET',
    path: '/auth',
    config: {
      auth: 'jwt',
      handler: function (request, reply) {
        reply('ok');
      }
    }
  });

  server.start();
});
```
