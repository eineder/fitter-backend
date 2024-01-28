const dynamo = require("../lib/dynamo");
require("dotenv").config();

async function doIt() {
  try {
    const resp = await dynamo.internal.getUsersWithTweets();
    const id = resp.Items[0].id;
    console.log(id);
    const response = await dynamo.internal.deleteUserData([id]);
    await dynamo.deleteUsers([id]);

    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

doIt();
