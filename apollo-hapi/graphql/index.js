"use strict";

const { gql } = require("apollo-server-hapi");

const internals = {};

internals.typeDefs = gql`
  type File {
    encoding: String!
    filename: String!
    mimetype: String!
  }
  type Query {
    uploads: [File!]!
  }
  type Mutation {
    singleUpload(file: Upload!): File!
  }
`;

internals.resolvers = {
  Mutation: {
    async singleUpload(parent, args) {
      const file = await args.file;
      file.file.filename = 'fixture.jpg';
      return file.file;
    },
  },
  Query: {
    uploads() {
      return [];
    },
  },
};

module.exports = {
  typeDefs: internals.typeDefs,
  resolvers: internals.resolvers,
  uploads: true,
};
