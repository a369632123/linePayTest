const axios = require('axios');
require("dotenv").config();
const { LINEPAY_CHANNEL_ID, LINEPAY_CHANNEL_SECRET_KEY } = process.env;

const crypto = require("crypto");

function signKey(clientKey, msg) {
  const encoder = new TextEncoder();
  return crypto
    .createHmac("sha256", encoder.encode(clientKey))
    .update(encoder.encode(msg))
    .digest("base64");
}

function handleBigInteger(text) {
  const largeNumberRegex = /:\s*(\d{16,})\b/g;
  const processedText = text.replace(largeNumberRegex, ': "$1"');

  const data = JSON.parse(processedText);

  return data;
}

async function requestOnlineAPI({
  method,
  baseUrl = "https://sandbox-api-pay.line.me",
  apiPath,
  queryString = "",
  data = null,
  signal = null,
}) {
  const nonce = crypto.randomUUID();
  let signature = "";
  let response = null;

  // 根據不同方式(method)生成MAC
  if (method === "GET") {
    signature = signKey(
      LINEPAY_CHANNEL_SECRET_KEY,
      LINEPAY_CHANNEL_SECRET_KEY + apiPath + queryString + nonce
    );
    response = await axios.get(
        `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
        {
            headers: {
            'Content-Type': 'application/json',
            'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
            'X-LINE-Authorization-Nonce': nonce,
            'X-LINE-Authorization': signature,
            },
        }
    );

  } else if (method === "POST") {
    signature = signKey(
      LINEPAY_CHANNEL_SECRET_KEY,
      LINEPAY_CHANNEL_SECRET_KEY + apiPath + JSON.stringify(data) + nonce
    );

    response = await axios.post(
        `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
        data,
        {
            headers: {
            'Content-Type': 'application/json',
            'X-LINE-ChannelId': LINEPAY_CHANNEL_ID,
            'X-LINE-Authorization-Nonce': nonce,
            'X-LINE-Authorization': signature,
            },
        }
    );
  }

//   const response = await fetch(
//     `${baseUrl}${apiPath}${queryString !== "" ? "&" + queryString : ""}`,
//     {
//       method: method,
//       headers: {
//         "Content-Type": "application/json",
//         ...headers,
//       },
//       body: data ?JSON.stringify(data) : null,
//       signal: signal,
//     }
//   );

  console.log(response.status, response.data);
    
  return response

//   const processedResponse = handleBigInteger(await response.text());

//   return processedResponse;
  
}

module.exports = {
  requestOnlineAPI,
};