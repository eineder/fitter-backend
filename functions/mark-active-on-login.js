const { log } = require("../shared/logger.js");

module.exports.handler = async (event) => {
  log("Login handler:", event);
  //   if (event.triggerSource !== "PostAuthentication_ConfirmSignUp") {
  //   }
};
