module.exports = {
  Query: {
    getUserByID: (_, args, context) => {
      const { User } = context.dataSources.models;
      return User.findById(args.id);
    },
  },
  Mutation: {
    register: (_, args, context) => {
      const { User } = context.dataSources.models;
      return User.register(args.input);
    },
  },
};
