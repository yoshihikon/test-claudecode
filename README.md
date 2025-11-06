# Next.js AI Chat with HTML Tool

Claude APIを使用したAIチャットアプリケーションです。Claude APIのツール機能を使用して、必ずHTML形式で回答を取得します。

## 特徴

- 🤖 Claude API（claude-sonnet-4-5）を使用 - 2025年最新モデル
- 🎨 HTML形式での回答を強制（tool_choiceで制御）
- 🔧 Claude APIツールプロトコルに完全準拠
- 💬 会話履歴の保持（tool_result自動管理）
- 📱 レスポンシブデザイン
- ⚡ Next.js 14 App Router使用

### 利用可能なモデル（2025年11月時点）

- **Claude Sonnet 4.5** (`claude-sonnet-4-5`): デフォルトで使用。2025年9月リリースの最新モデル。コーディングとエージェントタスクに最適。料金: $3/$15 per million tokens
- **Claude Haiku 4.5** (`claude-haiku-4-5`): 2025年10月リリース。高速・低コスト。料金: $1/$5 per million tokens
- **Claude 3.7 Sonnet** (`claude-3-7-sonnet`): 2025年2月リリース。ハイブリッドAI推論モデル

モデルを変更する場合は、`app/api/chat/route.ts`の95行目の`model`パラメータを編集してください。

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

### HTML Tool による確実な出力

このアプリケーションは、**Claude APIのツール機能**を使用して、100%確実にHTML形式で回答を取得します。

```typescript
const htmlTool: Anthropic.Tool = {
  name: "render_html",
  description: "ユーザーへの回答をHTML形式で出力します。",
  input_schema: {
    type: "object",
    properties: {
      html_content: {
        type: "string",
        description: "HTML形式の回答内容"
      }
    },
    required: ["html_content"]
  }
};
```

`tool_choice: { type: "tool", name: "render_html" }` で、Claudeに必ずこのツールを使用させます。

### ツールプロトコルへの準拠

Claude APIは、ツール使用時に以下のプロトコルを要求します：

```
User message → Assistant (tool_use) → User (tool_result) → ...
```

各`tool_use`の後には、必ず`tool_result`が必要です。このアプリでは、バックエンドで自動的に`tool_result`を管理します：

**実装の流れ：**

1. **初回メッセージ**
   ```
   User: "こんにちは"
   → Assistant: tool_use (render_html)
   ```

2. **2回目以降**
   ```
   会話履歴の最後がtool_useの場合
   → tool_resultを自動挿入
   → 新しいユーザーメッセージと結合

   User: [tool_result, "次の質問"]
   → Assistant: tool_use (render_html)
   ```

**コードの重要部分：**

```typescript
// 前回のtool_useに対するtool_resultを自動追加
if (lastMessage.role === 'assistant' && hasToolUse) {
  messages.push({
    role: 'user',
    content: [{ type: 'tool_result', tool_use_id: '...', content: '...' }]
  });
}

// 新しいメッセージを同じcontent配列に追加（同じroleの連続を回避）
lastUserMessage.content.push({ type: 'text', text: message });
```

### API エンドポイント

`/api/chat`エンドポイントが以下を行います：

1. ユーザーメッセージと会話履歴を受け取る
2. 前回の`tool_use`に対する`tool_result`を自動挿入
3. Claude APIに`tool_choice`付きでリクエスト
4. `tool_use`ブロックからHTML内容を抽出
5. HTML内容と更新された会話履歴を返す

### このアプローチの利点

✅ **確実性**: `tool_choice`でHTML形式を100%保証（システムプロンプトより確実）
✅ **プロトコル準拠**: Claude APIのツール使用ルールに完全準拠
✅ **自動管理**: `tool_result`を自動で挿入、ユーザーは意識不要
✅ **会話継続**: 複数ターンの会話も正常に動作

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
