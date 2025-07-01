const crypto = require("crypto");

function signKey(clientKey, msg) {
  const encoder = new TextEncoder();
  return crypto
    .createHmac("sha256", encoder.encode(clientKey))
    .update(encoder.encode(msg))
    .digest("base64");
}

module.exports = {
  signKey
};