module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Sequelize.literal("EXTRACT(EPOCH from now()) * 1000")
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Sequelize.literal("EXTRACT(EPOCH from now()) * 1000")
      }
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable("users")
};
