# Next.js AI Chat with HTML Output

Claude APIを使用したAIチャットアプリケーションです。システムプロンプトを使用して、必ずHTML形式で回答を取得します。

## 特徴

- 🤖 Claude API（claude-sonnet-4-5）を使用 - 2025年最新モデル
- 🎨 HTML形式での回答を強制（システムプロンプトで制御）
- 💬 会話履歴の保持
- 📱 レスポンシブデザイン
- ⚡ Next.js 14 App Router使用

### 利用可能なモデル（2025年11月時点）

- **Claude Sonnet 4.5** (`claude-sonnet-4-5`): デフォルトで使用。2025年9月リリースの最新モデル。コーディングとエージェントタスクに最適。料金: $3/$15 per million tokens
- **Claude Haiku 4.5** (`claude-haiku-4-5`): 2025年10月リリース。高速・低コスト。料金: $1/$5 per million tokens
- **Claude 3.7 Sonnet** (`claude-3-7-sonnet`): 2025年2月リリース。ハイブリッドAI推論モデル

モデルを変更する場合は、`app/api/chat/route.ts`の62行目の`model`パラメータを編集してください。

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

### HTML出力の強制

このアプリケーションは、**システムプロンプト**を使用して、ClaudeにHTML形式での回答を強制します。

```typescript
const SYSTEM_PROMPT = `あなたは親切なAIアシスタントです。

重要な指示：
- 回答は必ず有効なHTML形式で記述してください
- レスポンスの全体を適切なHTMLタグで構造化してください
- 段落には<p>タグ、見出しには<h1>〜<h6>タグ、リストには<ul>/<ol>と<li>タグを使用してください
- コードブロックには<pre><code>タグを使用してください
...
`;
```

このアプローチの利点：
- **会話履歴との互換性**: ツール使用に関する複雑なプロトコルを回避
- **シンプル**: プロンプトだけでHTML形式を確実に取得
- **柔軟性**: 会話の文脈を維持しながらHTML出力を継続

### API エンドポイント

`/api/chat`エンドポイントが以下を行います：

1. ユーザーメッセージと会話履歴を受け取る
2. システムプロンプトでHTML形式を指定してClaude APIにリクエスト
3. テキストレスポンスからHTML内容を抽出
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
