const f = require("faker");
const staticMethods = require("../user-static_methods");

const mockUser = {
  id: f.random.number(),
  email: f.internet.email(),
  plainPassword: f.internet.password(),
};

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
    test("Creates a new user given valid input", async () => {
      const hashedPassword = `${mockUser.plainPassword}55`;

      const User = {
        create: ({ email, password }) => ({
          id: mockUser.id,
          email,
          password,
        }),
        count: () => 0,
        verifyAndHashPassword: password => hashedPassword,
        register: staticMethods.register,
      };

      const newUser = await User.register({
        email: mockUser.email,
        password: mockUser.plainPassword,
      });

      const expected = {
        id: mockUser.id,
        email: mockUser.email,
        password: hashedPassword,
      };

      expect(newUser).toEqual(expected);
    });

    test("Throws a UserInputError Error when given an email that is already registered", async () => {
      const User = {
        count: () => 1,
        register: staticMethods.register,
      };

      try {
        await User.register({
          email: mockUser.email,
          password: mockUser.plainPassword,
        });
      } catch (error) {
        expect(error.constructor.name).toBe("UserInputError");
        expect(error.message).toBe("A user with this email already exists");
        expect(error.invalidArgs).toContain("input.email");
      }
    });

    test("Throws a UserInputError Error when given an invalid password", async () => {
      const { register, verifyPassword, verifyAndHashPassword } = staticMethods;

      const password = "abc";
      const User = {
        count: () => 0,
        register,
        verifyPassword,
        verifyAndHashPassword,
      };

      try {
        await User.register({ email: mockUser.email, password });
      } catch (error) {
        expect(error.constructor.name).toBe("UserInputError");
        expect(error.message).toBe("Password must be at least 6 characters");
        expect(error.invalidArgs).toContain("input.password");
      }
    });
  });
});
