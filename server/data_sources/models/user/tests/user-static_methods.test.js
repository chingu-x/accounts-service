const f = require("faker");
const { testError } = require("../../../../test_utils");
const staticMethods = require("../user-static_methods");

describe("User Model: static methods", () => {
  test("hashPassword(): hashes a plain text password", async () => {
    const password = "some password";
    const hashedPassword = await staticMethods.hashPassword(password);
    expect(hashedPassword).not.toEqual(password);
  });

  describe("verifyPassword(): validates the password", () => {
    const User = { verifyPassword: staticMethods.verifyPassword };

    test("throws an error if the length is < 6", () => {
      try {
        User.verifyPassword("abc");
      } catch (error) {
        expect(error.message).toBe("Password must be at least 6 characters");
      }
    });

    test("throws an error if there are no uppercase characters", () => {
      try {
        User.verifyPassword("abcdefg");
      } catch (error) {
        expect(error.message).toBe(
          "Password must include one uppercase character",
        );
      }
    });

    test("throws an error if there are no numeric characters", () => {
      try {
        User.verifyPassword("Abcdefg");
      } catch (error) {
        expect(error.message).toBe(
          "Password must include one numeric character",
        );
      }
    });

    test("throws an error if there are no non-alphanumeric characters", () => {
      try {
        User.verifyPassword("Abcdefg5");
      } catch (error) {
        expect(error.message).toBe(
          "Password must include one non-alphanumeric character",
        );
      }
    });
  });

  test("verifyAndHashPassword(): composes verifyPassword() and hashPassword()", async () => {
    const User = {
      verifyPassword: () => {},
      hashPassword: () => {},
      verifyAndHashPassword: staticMethods.verifyAndHashPassword,
    };

    const password = "password";
    const verifySpy = jest.spyOn(User, "verifyPassword");
    const verifyHash = jest.spyOn(User, "hashPassword");

    await User.verifyAndHashPassword(password);
    expect(verifySpy).toHaveBeenCalledWith(password);
    expect(verifyHash).toHaveBeenCalledWith(password);
  });

  describe("register(): registers a new Chingu User", () => {
    const input = {
      email: f.internet.email(),
      plainPassword: f.internet.password(),
    };

    test("Creates a new user given valid input", async () => {
      const hashedPassword = `${input.password}55`;
      const User = {
        create: () => {},
        count: () => 0,
        verifyAndHashPassword: password => hashedPassword,
        register: staticMethods.register,
      };

      const createSpy = jest.spyOn(User, "create");

      await User.register(input);
      expect(createSpy).toHaveBeenCalledWith({
        email: input.email,
        password: hashedPassword,
      });
    });

    test("Throws a UserInputError Error when given an email that is already registered", async () => {
      const User = {
        count: () => 1,
        register: staticMethods.register,
      };

      try {
        await User.register(input);
      } catch (error) {
        testError({
          error,
          errorType: "UserInputError",
          message: "A user with this email already exists",
          invalidArgs: ["input.email"],
        });
      }
    });

    test("Throws a UserInputError Error when given an invalid password", async () => {
      const { register, verifyPassword, verifyAndHashPassword } = staticMethods;
      const User = {
        count: () => 0,
        register,
        verifyPassword,
        verifyAndHashPassword,
      };

      try {
        await User.register({ email: input.email, password: "abc" });
      } catch (error) {
        testError({
          error,
          errorType: "UserInputError",
          message: "Password must be at least 6 characters",
          invalidArgs: ["input.password"],
        });
      }
    });
  });
});
