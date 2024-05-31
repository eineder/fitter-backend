const { unmarshall } = require("@aws-sdk/util-dynamodb");
const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

module.exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event.Records || event.Records.length === 0)
    throw new Error("No records found in the event");

  if (event.Records.length > 1)
    throw new Error(
      "Multiple records found in the event - this is not expected"
    );

  const record = event.Records[0];
  if (record.eventName !== "INSERT")
    throw new Error(
      `Only INSERT events are supported, received ${record.eventName}`
    );

  const tweet = unmarshall(record.dynamodb.NewImage);
  const cmd = new PutEventsCommand({
    Entries: [
      {
        Source: "tweets.service",
        DetailType: "new_tweet_posted",
        Detail: JSON.stringify(tweet, 0, 2),
        EventBusName: "default",
      },
    ],
  });

  console.log("Sending event to EventBridge:", JSON.stringify(cmd, null, 2));
  const client = new EventBridgeClient();
  const response = await client.send(cmd);
  console.log("EventBridge response:", JSON.stringify(response, null, 2));

  return event;
};
