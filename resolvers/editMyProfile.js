import { update } from "@aws-appsync/utils/dynamodb";

export function request(ctx) {
  const updateObj = {
    key: { id: ctx.identity.username },
    update: {
      name: ctx.arguments.newProfile.name,
      imageUrl: ctx.arguments.newProfile.imageUrl,
      backgroundImageUrl: ctx.arguments.newProfile.backgroundImageUrl,
      bio: ctx.arguments.newProfile.bio,
      location: ctx.arguments.newProfile.location,
      website: ctx.arguments.newProfile.website,
      birthdate: ctx.arguments.newProfile.birthdate,
    },
    // When active, this line leads to the error:
    // condition: { expression: "attribute_exists(id)" },
  };

  // Workaround: Attach the condition object to the DynamoDBUpdateItem
  const requestObj = update(updateObj);
  requestObj.condition = { expression: "attribute_exists(id)" };

  return requestObj;
}

export function response(ctx) {
  return ctx.result;
}
