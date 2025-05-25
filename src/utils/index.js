const responseHelpers = require("./responseHelpers");
const { seedDatabase } = require("./seedDatabase");

module.exports = {
  ...responseHelpers,
  seedDatabase,
};
