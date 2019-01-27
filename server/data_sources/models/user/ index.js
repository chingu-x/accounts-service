const staticMethods = require("./user-static_methods");
// const instanceMethods = require("./instance_methods");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    email: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: sequelize.literal("EXTRACT(EPOCH from now()) * 1000"),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: sequelize.literal("EXTRACT(EPOCH from now()) * 1000"),
      onUpdate: "SET DEFAULT",
    },
  });

  return Object.assign(
    User,
    staticMethods,
    // { prototype: instanceMethods },
  );
};
