const bcrypt = require("bcrypt");
const { UserInputError } = require("apollo-server-express");

/* MAGIC NUMBER */
const SALT_ROUNDS = 12;

/**
 * Hashes a plain text password
 * @param {string} password A plain text password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password meets the requirements:
 * - 6 character minimum
 * - one uppercase
 * - one numeric
 * - one non-alphanumeric
 * @param {string} password A plain text password
 * @throws {Error} if password fails validation
 */
function verifyPassword(password) {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!/[A-Z]+/.test(password)) {
    throw new Error("Password must include one uppercase character");
  }

  if (!/[0-9]+/.test(password)) {
    throw new Error("Password must include one numeric character");
  }

  if (!/[^0-9A-Za-z]+/.test(password)) {
    throw new Error("Password must include one non-alphanumeric character");
  }
}

/**
 * Verifies the validity of the given password through verifyPassword()
 * Proceeds to hashing password if validation passes
 * @param {string} password A plain text text password
 * @return {string} A validated and hashed password
 */
function verifyAndHashPassword(password) {
  verifyPassword(password);
  return this.hashPassword(password);
}

/**
 * Registers a new user
 * @param {Object} input - UserRegistration input
 * @param {string} input.email - A unique email
 * @param {string} input.password - The new password
 * @throws UserInputError [email: not unique, password: invalid]
 * @return {object} A newly created User instance
 */
async function register(input) {
  const { email, password } = input;
  const existingUser = await this.count({ where: { email } });
  if (existingUser) {
    throw new UserInputError("A user with this email already exists", {
      invalidArgs: ["input.email"],
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await this.verifyAndHashPassword(password);
  } catch (passwordError) {
    throw new UserInputError(passwordError.message, {
      invalidArgs: ["input.password"],
    });
  }

  return this.create({ email, password: hashedPassword });
}

module.exports = {
  register,
  hashPassword,
  verifyPassword,
  verifyAndHashPassword,
  constants: { SALT_ROUNDS },
};
