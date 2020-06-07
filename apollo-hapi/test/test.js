"use strict";

const fs = require("fs");
const path = require("path");
const test = require("ava");
const Hapi = require("@hapi/hapi");
const FormData = require("form-data");

const setup = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  await server.register([
    {
      plugin: require("../apollo"),
      options: require("../graphql"),
    },
  ]);

  return { server };
};

test("upload a file", async (t) => {
  const { server } = await setup();

  const formData = new FormData();

  // graphql parts
  formData.append(
    "operations",
    JSON.stringify({
      query: `
    mutation($file: Upload!) {
        singleUpload(file: $file) {
            encoding
            filename
            mimetype
        }
    }`,
      variables: {
        file: null,
      },
    })
  );

  // map between grahpl parts and files
  formData.append(
    "map",
    JSON.stringify({
      upload: ["variables.file"],
    })
  );

  // actual file stream
  formData.append(
    "upload",
    fs.readFileSync(path.join(__dirname, "_files", "fixture.jpg"))
  );

  const response = await server.inject({
    method: 'POST',
    url: "/graphql",
    headers: formData.getHeaders(),
    payload: formData.getBuffer(),
  });

  t.is(response.statusCode, 200);
});
