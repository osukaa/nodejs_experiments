"use strict";

const { processRequest } = require('graphql-upload');
const { ApolloServer } = require("apollo-server-hapi");

const plugin = {
  name: "apollo",
  async register(server, options) {
    const app = new ApolloServer(options);

    await app.applyMiddleware({
      app: server,
      route: {
        /**
         * Github fix for hapi upload: https://github.com/apollographql/apollo-server/issues/1680
         * This works because between onPreAuth and onPostAuth is payload processing
         * We disable payload processing on PreAuth, and parse the payload with `graphql-upload` module
         * and set the payload after hapi goes through its own step
         */
        ext: {
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
