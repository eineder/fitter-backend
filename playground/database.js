const { getOutdatedUsers, deleteUsers } = require("../lib/dynamo");
require("dotenv").config();

try {
  const response = await deleteUsers(["c7e5175f-c05c-56aa-95e1-cedd849ae33c"]);
  console.log(response);
} catch (error) {
  console.log(error);
}
