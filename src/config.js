const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number.parseInt(process.env.PORT ?? "3000", 10),
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET ?? "",
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
};

const missingEnv = [];

if (!config.lineChannelSecret) {
  missingEnv.push("LINE_CHANNEL_SECRET");
}

if (!config.lineChannelAccessToken) {
  missingEnv.push("LINE_CHANNEL_ACCESS_TOKEN");
}

if (missingEnv.length > 0) {
  console.warn(
    `[WARN] Missing environment variables: ${missingEnv.join(", ")}`
  );
}

module.exports = config;
