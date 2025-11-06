# Next.js AI Chat with HTML Tool

Claude APIを使用したAIチャットアプリケーションです。Claude APIのtool機能を使用して、必ずHTML形式で回答を取得します。

## 特徴

- 🤖 Claude API（claude-3-5-sonnet-20240620）を使用
- 🎨 HTML形式での回答を強制（toolを使用）
- 💬 会話履歴の保持
- 📱 レスポンシブデザイン
- ⚡ Next.js 14 App Router使用

### 利用可能なモデル

- **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20240620`): デフォルトで使用（安定版）
- **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`): 2025年の最新モデル（コーディングとエージェントタスクに最適）

モデルを変更する場合は、`app/api/chat/route.ts`の`model`パラメータを編集してください。

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **AI API**: Anthropic Claude API
- **スタイリング**: CSS Modules

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、Anthropic APIキーを設定します。

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Claude API エンドポイント
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # メインチャット画面
│   ├── page.module.css           # チャット画面のスタイル
│   └── globals.css               # グローバルスタイル
├── package.json
├── tsconfig.json
└── next.config.js
```

## 仕組み

### HTML Tool

このアプリケーションは、Claude APIの`tool`機能を使用して、必ずHTML形式で回答を取得します。

```typescript
const htmlTool = {
  name: "render_html",
  description: "ユーザーへの回答をHTML形式で出力します。",
  input_schema: {
    type: "object",
    properties: {
      html_content: {
        type: "string",
        description: "ユーザーへの回答をHTML形式で記述したもの。"
      }
    },
    required: ["html_content"]
  }
};
```

`tool_choice`パラメータに`{ type: "tool", name: "render_html" }`を指定することで、Claudeに必ずこのtoolを使用させます。

### API エンドポイント

`/api/chat`エンドポイントが以下を行います：

1. ユーザーメッセージと会話履歴を受け取る
2. Claude APIにtool付きでリクエスト
3. toolの実行結果からHTML内容を抽出
4. HTML内容と更新された会話履歴を返す

### フロントエンド

- React hooks（useState、useEffect）を使用した状態管理
- `dangerouslySetInnerHTML`を使用してHTMLコンテンツをレンダリング
- ローディング状態の表示
- 自動スクロール機能

## ビルド

```bash
npm run build
npm start
```

## 注意事項

- HTMLコンテンツは`dangerouslySetInnerHTML`を使用してレンダリングされるため、信頼できるソース（Claude API）からのみ使用してください
- APIキーは必ず環境変数で管理し、`.env`ファイルは`.gitignore`に含めてください
- 本番環境では適切なレート制限とエラーハンドリングを実装してください

## ライセンス

MIT
