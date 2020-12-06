import { NextApiRequest, NextApiResponse } from "next";

const { App, LogLevel } = require("@slack/bolt");
const dotenv = require('dotenv')

dotenv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

// You probably want to use a database to store any user information ;)
let usersStore: any = {};

// Fetch users using the users.list method
async function fetchUsers() {
  try {
    // Call the users.list method using the built-in WebClient
    const result = await app.client.users.list({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN
    });

    saveUsers(result.members);
  }
  catch (error) {
    console.error(error);
  }
}

// Put users into the JavaScript object
function saveUsers(usersArray: Array<any>) {
  let userId = '';
  usersArray.forEach(function(user: any) {
    // Key user info on their unique user ID
    userId = user["id"];
    if (!user.is_bot && !user.deleted)
      usersStore[userId] = user;
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if(!!req) {
    await app.start(3031);
    await fetchUsers()
    await app.stop();
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    return res.json(usersStore)
  }
}