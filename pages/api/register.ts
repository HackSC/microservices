import { NowRequest, NowResponse } from '@vercel/node'

export default (request: NowRequest, response: NowResponse) => {
  const data = request.body
  const message = (text: string, in_channel?: boolean) => { 
    return {
      "response_type": in_channel ? "in_channel" : "ephemeral",
      "text": text
   }
  }
  

  if (!data.text) {
    response.json(message("Please provide a team name: /hack <team_name>"))
  } else {
    if (data.text.split(" ").length > 3 && data.text.length < 100) {
      response.json(message("Team names must be less than 3 words and 100 characters"))
    }
    console.log(message(`Successfully created team ${data.text}`, true))
    response.json(message(`Successfully created team ${data.text}`, true))
  }

  // response.status(200).send(data)
}