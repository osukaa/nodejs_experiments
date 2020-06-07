"use strict";

require("make-promises-safe"); // installs an 'unhandledRejection' handler
const Hapi = require("@hapi/hapi");

const main = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  await server.register([
    {
      plugin: require("./apollo"),
      options: require("./graphql"),
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

main();
