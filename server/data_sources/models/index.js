const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const logger = require("@chingu-labs/logger");

const {
  DB_HOST: host = 'http://localhost',
  DB_PORT: port = '5432',
  DB_USERNAME: username = 'postgres',
  DB_PASSWORD: password,
  DB_NAME: database = 'accounts_db',
} = process.env;

const initializeModels = () => {
  logger.info('Initializing Postgres database connection...');
  const sequelize = new Sequelize({
    host,
    port,
    username,
    password,
    database, 
    dialect: 'postgres',
    logging: logger.debug,
    define: {
      underscored: true,
      underscoredAll: true,
    }
  });

  const db = {};

  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
      const model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
};

module.exports = { initializeModels };
