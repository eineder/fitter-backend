const { unmarshall } = require("@aws-sdk/util-dynamodb");
const process = require("process");
const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

module.exports.handler = async (event) => {
  if (!event.Records || event.Records.length === 0)
    throw new Error("No records found in the event");

  if (event.Records.length > 1)
    throw new Error(
      "Multiple records found in the event - this is not expected"
    );

  const record = event.Records[0];
  if (record?.dynamodb?.ApproximateCreationDateTime) {
    const imageTime = new Date(
      record.dynamodb.ApproximateCreationDateTime * 1000
    );
    const differenceInMilliseconds = Date.now() - imageTime;
    const differenceInMinutes = Math.floor(
      differenceInMilliseconds / (1000 * 60)
    );
    if (differenceInMinutes > 10) {
      console.log(
        `The record is too old (${differenceInMinutes} minutes) - ignoring`
      );
      return event;
    }
  }
  if (record.eventName !== "INSERT") {
    console.log(
      `Only INSERT events are supported, received ${record.eventName} - ignoring`
    );
    return event;
  }
  console.log("Received event:", JSON.stringify(event, null, 2));

  const fullTweet = unmarshall(record.dynamodb.NewImage);
  const detail = {
    tweet: {
      id: fullTweet.id,
      text: fullTweet.text,
    },
    tweetsTableName: process.env.TWEETS_TABLE,
  };
  console.log("Detail:", JSON.stringify(detail, null, 2));

  const stage = process.env.STAGE;
  if (!stage) throw new Error("No STAGE environment variable set");

  const cmd = new PutEventsCommand({
    Entries: [
      {
        Source: "tweets.service",
        DetailType: stage + "_new_tweet_posted",
        Detail: JSON.stringify(detail, 0, 2),
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
