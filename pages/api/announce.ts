import { NowRequest, NowResponse } from '@vercel/node'

import { App, LogLevel }  from "@slack/bolt"
import dotenv from 'dotenv'

dotenv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

export default async (req: NowRequest, res: NowResponse) => {
  const { chanId, chanIds, message, blocks } = req.query

  await app.start(3032)
  try {
    // multiple
    if (chanIds) {
      // @ts-ignore bc always string
      const chans = chanIds.split(",")
      for (let chan of chans) {
        const result = await app.client.chat.postMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: chan.toString(),
          text: message.toString()
        });
        console.log(result);
      }
    } else {
      if (blocks) {
        // const result = await app.client.chat.postMessage({
        //   channel: chanId.toString(),
        //   text: '',
        //   blocks: blocks
        // });
      } else {
        const result = await app.client.chat.postMessage({
          channel: chanId.toString(),
          text: message.toString(),
          token: process.env.SLACK_BOT_TOKEN,
        });

        console.log(result);
      }
    }
  } catch (error) {
    console.error(error)
    res.end(500)
  }

  await app.stop()
  res.json({status: 'success'})
}