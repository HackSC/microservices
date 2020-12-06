import {  NextApiRequest, NextApiResponse } from "next";

const { App, LogLevel } = require("@slack/bolt");
const dotenv = require('dotenv')

dotenv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

// You probably want to use a database to store any conversations information ;)
let conversationsStore: any = {};

// Fetch conversations using the conversations.list method
async function fetchConversations() {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await app.client.conversations.list({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      types: 'public_channel,private_channel'
    });

    saveConversations(result.channels);
  }
  catch (error) {
    console.error(error);
  }
}

// Put conversations into the JavaScript object
function saveConversations(conversationsArray: Array<any>) {
  let conversationId = '';
  conversationsArray.forEach(function(conversation){
    // Key conversation info on its unique ID
    conversationId = conversation["id"];
    const date = new Date(new Date(0).setUTCSeconds(conversation.created));
    // Store the entire conversation object (you may not need all of the info)
    conversationsStore[conversationId] = {
      id: conversationId,
      name: conversation.name, 
      is_channel: conversation.is_channel,
      is_group: conversation.is_group,
      is_archived: conversation.is_archived,
      created: date.toLocaleDateString('en-US'),
      topic: conversation.topic,
      num_members: conversation.num_members,
      ...conversation
    };
  });

}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(!!req) {
    await app.start(3030);
    await fetchConversations()
    await app.stop();
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    return res.json({ ...conversationsStore })
  }
}