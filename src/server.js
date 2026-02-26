const express = require("express");
const path = require("path");
const config = require("./config");
const {
  verifyLineSignature,
  replyText,
  fetchMessageContent,
} = require("./lineService");

const app = express();
const publicDir = path.join(__dirname, "..", "public");

app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const rawBody = req.body;
    const signature = req.get("x-line-signature");

    if (!verifyLineSignature(rawBody, signature, config.lineChannelSecret)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const bodyText = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf-8")
      : JSON.stringify(rawBody);
    const payload = JSON.parse(bodyText);
    const events = Array.isArray(payload.events) ? payload.events : [];

    await Promise.all(events.map(handleEvent));
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function handleEvent(event) {
  if (!event?.replyToken || event.replyToken === "00000000000000000000000000000000") {
    return;
  }

  if (event.type !== "message" || !event.message) {
    return;
  }

  if (event.message.type === "text") {
    await handleTextMessage(event);
    return;
  }

  if (event.message.type === "image") {
    await handleImageMessage(event);
    return;
  }

  await replyText(
    event.replyToken,
    "文字か冷蔵庫の写真を送ってくれたら、くれぴが献立づくりを手伝うよ〜😆🍳",
    config.lineChannelAccessToken
  );
}

async function handleTextMessage(event) {
  const text = event.message.text ?? "";

  if (text.includes("プレミアム")) {
    await replyText(
      event.replyToken,
      [
        "くれぴプレミアム、気になってくれてうれしい〜👑✨",
        "・アレルギー/苦手食材の完全ブロック",
        "・1週間のまとめ買い＆献立自動化",
        "・プロの隠し味アレンジ提案",
      ],
      config.lineChannelAccessToken
    );
    return;
  }

  await replyText(
    event.replyToken,
    [
      "メッセージありがとう〜😆",
      "冷蔵庫の写真を1枚送ってくれたら、今日のおすすめレシピ3つを作るよ🍳",
    ],
    config.lineChannelAccessToken
  );
}

async function handleImageMessage(event) {
  try {
    const imageBuffer = await fetchMessageContent(
      event.message.id,
      config.lineChannelAccessToken
    );

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Empty image content");
    }

    await replyText(
      event.replyToken,
      [
        "写真ありがとう〜！しっかり受け取ったよ😆📸",
        "いまはWebhookの土台を準備中だから、次のステップでAI分析をつなげていくね✨",
      ],
      config.lineChannelAccessToken
    );
  } catch (error) {
    console.error("[IMAGE_PROCESS_ERROR]", error);
    await replyText(
      event.replyToken,
      "うまく写真を読み取れなかったかも…もう一度明るいところで撮って送ってね！",
      config.lineChannelAccessToken
    );
  }
}

app.listen(config.port, () => {
  console.log(`Kurepi LINE Bot server listening on port ${config.port}`);
});
