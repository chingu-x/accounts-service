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
        register: staticMethods.register
      };

      try {
        await User.register({ email: mockUser.email, password: mockUser.plainPassword });
      } catch(error) {
        expect(error.constructor.name).toBe('UserInputError');
        expect(error.message).toBe('A user with this email already exists');
        expect(error.invalidArgs).toContain('input.email');
      }
    });
  });
});
