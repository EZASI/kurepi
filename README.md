# くれぴ LINE Bot (Webhookベース)

「くれぴ」は、冷蔵庫写真からレシピ提案を返す LINE Bot です。  
このリポジトリでは、まず **Node.js + Express** で LINE Messaging API の Webhook を受けるベース実装を用意しています。

## 技術スタック（初期提案）

- **バックエンド**: Node.js + Express
- **連携API**: LINE Messaging API（Webhook / Reply API）
- **AI拡張予定**: OpenAI Vision API（次タスクで接続）
- **環境変数管理**: dotenv

## 実装済み機能（今回）

- `GET /health` ヘルスチェック
- `POST /webhook` LINE Webhook受信
- `x-line-signature` の HMAC-SHA256 署名検証
- テキストメッセージ分岐
  - 「プレミアム」含有時: プレミアム案内返信
  - それ以外: 写真送信を案内
- 画像メッセージ受信
  - LINE Content API から画像バイナリ取得
  - 取得失敗時: 「もう一度明るいところで撮って送ってね！」を返信

## セットアップ

```bash
npm install
cp .env.example .env
```

`.env` を編集して以下を設定:

```env
PORT=3000
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
OPENAI_API_KEY=your_openai_api_key
```

起動:

```bash
npm run dev
```

## LINE Developers 側の設定

1. Messaging API チャネルを作成
2. **Channel secret** と **Channel access token** を `.env` に設定
3. Webhook URL に以下を設定（例）
   - `https://<your-domain>/webhook`
4. 「Webhookの利用」を有効化
5. 検証送信（Verify）で `200` が返ることを確認

## ディレクトリ構成

```text
src/
  aiPrompt.js       # くれぴ用システムプロンプト（次段で利用）
  config.js         # 環境変数読み込み
  lineService.js    # 署名検証 / Reply API / Content API
  server.js         # Express本体 & Webhookハンドラ
```

## 次タスク（予定）

- 画像を OpenAI Vision に渡して食材抽出
- 指定フォーマットで「おすすめレシピ3選」を生成
- ユーザーごとの嗜好保存（プレミアム準備）