const transformNames = require("./openapi-name-transformer.cjs");

/**
 * Обёртка для core сервиса
 */
module.exports = function coreTransformer(openApi) {
  return transformNames(openApi);
};