/**
 * Tests the existence and shape of a thrown Error
 * @param {object} options Options to test for
 * @param {Error} options.error The Error object to test
 * @param {string} options.errorType The Type of Error (constructor name)
 * @param {string} options.message The expected Error message
 * @param {[string]} options.invalidArgs An Array of invalid arguments [Apollo Errors only]
 */
const testError = options => {
  const { error, errorType, message, invalidArgs } = options;

  expect(error).toBeDefined();
  expect(error.constructor.name).toBe(errorType);
  expect(error.message).toBe(message);
  if (invalidArgs) {
    expect(error.invalidArgs).toEqual(expect.arrayContaining(invalidArgs));
  }
};

module.exports = {
  testError,
};
