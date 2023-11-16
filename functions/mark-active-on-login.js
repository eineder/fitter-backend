const { log } = require("../lib/logger.js");

module.exports.handler = async (event) => {
  console.log("Login handler:", event);
  console.log(" process.env.LOG_TABLE:", process.env.LOG_TABLE);

  log("Login handler:", event);
  //   if (event.triggerSource !== "PostAuthentication_ConfirmSignUp") {
  //   }

  return event;
};
