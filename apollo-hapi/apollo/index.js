"use strict";

const { ApolloServer, gql } = require("apollo-server-hapi");
const { processRequest } = require('graphql-upload');

const plugin = {
  name: "apollo",
  async register(server, options) {
    const app = new ApolloServer(options);

    await app.applyMiddleware({
      app: server,
      route: {
        ext: {
          /**
           * Github fix for hapi upload:
           * https://github.com/apollographql/apollo-server/issues/1680
           */
          onPreAuth: {
            method: async function (request, h) {
              // trick hapi into not parsing the incoming request payload
              if (request.headers['content-type'].includes('multipart/form-data') && request.method === 'post') {
                request.route.settings.payload.parse = false;
                request.mime = 'multipart/form-data';
                request.app.payload = await processRequest(request.raw.req, request.raw.res);
              } else {
              // revert to standard hapi behavior
                request.route.settings.payload.parse = true;
              }
              return h.continue;
            }
          },
          onPostAuth: {
            method: async function (request, h) {
              // if payload was parsed by ext, use it here
              if (request.app.payload) {
                request.payload = request.app.payload;
              }
              return h.continue;
            }
          },
        },
      },
    });

    await app.installSubscriptionHandlers(server.listener);
  },
};

module.exports = plugin;
