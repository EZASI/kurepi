const crypto = require("crypto");

const LINE_API_BASE_URL = "https://api.line.me/v2/bot";

function verifyLineSignature(rawBody, signature, channelSecret) {
  if (!rawBody || !signature || !channelSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function replyText(replyToken, texts, channelAccessToken) {
  const normalizedTexts = Array.isArray(texts) ? texts : [texts];

  const messages = normalizedTexts
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .slice(0, 5)
    .map((text) => ({
      type: "text",
      text: text.slice(0, 5000),
    }));

  if (!replyToken || messages.length === 0 || !channelAccessToken) {
    return;
  }

  const response = await fetch(`${LINE_API_BASE_URL}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`LINE reply failed (${response.status}): ${bodyText}`);
  }
}

async function fetchMessageContent(messageId, channelAccessToken) {
  if (!messageId || !channelAccessToken) {
    return null;
  }

  const response = await fetch(
    `${LINE_API_BASE_URL}/message/${messageId}/content`,
    {
      headers: {
        Authorization: `Bearer ${channelAccessToken}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = {
  verifyLineSignature,
  replyText,
  fetchMessageContent,
};
