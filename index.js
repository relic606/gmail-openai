import OpenAI from "openai";
import readlineSync from "readline-sync";
import "dotenv/config";

// let APIcall = async () => {
//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_SECRET_KEY,
//   });

//   const chatHistory = [];

//   do {
//     const user_input = readlineSync.question("Enter your input: ");
//     const messageList = chatHistory.map(([input_text, completion_text]) => ({
//       role: "user" === input_text ? "ChatGPT" : "user",
//       content: input_text,
//     }));
//     messageList.push({ role: "user", content: user_input });

//     try {
//       const GPTOutput = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: messageList,
//       });

//       const output_text = GPTOutput.choices[0].message;
//       console.log(output_text);

//       chatHistory.push([user_input, output_text]);
//     } catch (error) {
//       if (error instanceof OpenAI.APIError) {
//         console.error(error.status); // e.g. 401
//         console.error(error.message); // e.g. The authentication token you passed was invalid...
//         console.error(error.code); // e.g. 'invalid_api_key'
//         console.error(error.type); // e.g. 'invalid_request_error'
//       } else {
//         // Non-API error
//         console.log(error);
//       }
//     }
//   } while (
//     readlineSync.question("\nYou Want more Results? (Y/N)").toUpperCase() ===
//     "Y"
//   );
// };
// APIcall();

//////////////////////////////////////////////////////////////////////////

import { promises as fs } from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });

  // const res = await gmail.users.labels.list({
  //   userId: "me",
  // });

  const res = await gmail.users.labels.get({
    userId: "me",
    id: "Label_7349405886059431818",
  });

  // const res = await gmail.users.messages.list({
  //   userId: "me",
  // });

  console.log(res.data);

  // const res = await gmail.users.messages.get({
  //   userId: "me",
  //   id: "18ad34beb2e24fd1",
  // });

  // let base64Message = res.data.payload.parts[0].body.data;
  // let decodedMessage = atob(base64Message);

  // console.log(decodedMessage);

  // const labels = res.data.labels;
  // if (!labels || labels.length === 0) {
  //   console.log("No labels found.");
  //   return;
  // }
  // console.log("Labels:");
  // labels.forEach((label) => {
  //   console.log(`- ${label.name}`);
  // });
}

authorize().then(listLabels).catch(console.error);
