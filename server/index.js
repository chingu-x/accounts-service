const { readFileSync } = require("fs");
const { join }= require('path');
const { importSchema } = require('graphql-import');
const https = require("https");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("@chingu-labs/logger");
const { ApolloServer } = require("apollo-server-express");
const { express: voyagerMiddleware } = require("graphql-voyager/middleware");

const { initializeDataSources } = require("./data_sources");

const typeDefs = importSchema(join(__dirname, 'schema.graphql'));
const resolvers = require('./resolvers');

const {
  NODE_ENV = "development",
  NODE_PORT = 3000,
  GRAPHQL_PATH = "/graphql",
  DISABLE_LOGGING = false,
  DISABLE_REQUEST_LOGGING = false,
  DISABLE_HTTPS = true,
} = process.env;

logger.info("Initializing express server");
const app = express();

if (!DISABLE_LOGGING && !DISABLE_REQUEST_LOGGING) {
  logger.info("Enabling request logging");
  app.use(
    morgan(
      ":date HTTP/:http-version :status :method :url :response-time ms :user-agent",
    ),
  );
}

const corsOptions = {
  origin: /^https\:\/\/.*\.chingu\.io$/,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
};
app.use(cors(corsOptions));

if (NODE_ENV === "development") {
  logger.info("Enabling GraphQL Voyager");
  app.use("/voyager", voyagerMiddleware({ endpointUrl: GRAPHQL_PATH }));
}

logger.info("Initializing apollo server");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => initializeDataSources(),
  // Exposed on /.well-known/apollo/server-health
  onHealthCheck: () =>
    new Promise((resolve, reject) => {
      // TODO: Add better health checks.
      resolve();
    }),
});
server.applyMiddleware({ app, path: GRAPHQL_PATH });

if (!DISABLE_HTTPS) {
  const sslOptions = {
    key: readFileSync("/path/to/ssl.key"),
    cert: readFileSync("/path/to/ssl.crt"),
  };

  https.createServer(sslOptions, app).listen(NODE_PORT, () => {
    logger.info(`HTTPS server up and running on port ${NODE_PORT}`);
  });
} else {
  app.listen(NODE_PORT, () => {
    logger.info(`Server up and running on port ${NODE_PORT}`);
  });
}
