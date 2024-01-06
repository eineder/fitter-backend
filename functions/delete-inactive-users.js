const dynamo = require("../lib/dynamo");

exports.handler = async (event, context) => {
  try {
    const scanResult = await dynamo.getOutdatedUsers();
    if (scanResult.Items && scanResult.Items.length === 0) {
      console.log("No items to delete");
      return event;
    }

    const ids = scanResult.Items.map((item) => item.id);
    const dynamoResponse = await dynamo.deleteUsers(ids);
    console.log("Deleted users from DB: ", dynamoResponse);

    const cognitoResponse = await cognito.deleteUsers(ids);
    console.log("Deleted users from Cognito: ", cognitoResponse);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    return event;
  }
};
