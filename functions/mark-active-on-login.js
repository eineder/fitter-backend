module.exports.handler = async (event) => {
  console.log("Login handler:", event);
  console.log(" process.env.LOG_TABLE:", process.env.LOG_TABLE);

  //   if (event.triggerSource !== "PostAuthentication_ConfirmSignUp") {
  //   }

  return event;
};
