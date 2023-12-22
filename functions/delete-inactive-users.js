const { getOutdatedUsers, deleteUsers } = require("../lib/dynamo");

exports.handler = async (event, context) => {
  try {
    const scanResult = await getOutdatedUsers();
    if (scanResult.Items && scanResult.Items.length === 0) {
      console.log("No items to delete");
      return event;
    }

    const ids = scanResult.Items.map((item) => item.id);
    const response = await deleteUsers(ids);
    console.log("Deleted users: ", response);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    return event;
  }
};
