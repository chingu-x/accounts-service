const { initializeModels } = require("./models");

/**
 * Initializes connections to data sources
 * @return {Object} Datasources object
 */
function initializeDataSources() {
  return {
    models: initializeModels()
  };
}

module.exports = { initializeDataSources };
