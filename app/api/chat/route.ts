import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// システムプロンプト：HTML形式での回答を強制
const SYSTEM_PROMPT = `あなたは親切なAIアシスタントです。

重要な指示：
- 回答は必ず有効なHTML形式で記述してください
- レスポンスの全体を適切なHTMLタグで構造化してください
- 段落には<p>タグ、見出しには<h1>〜<h6>タグ、リストには<ul>/<ol>と<li>タグを使用してください
- コードブロックには<pre><code>タグを使用してください
- 強調には<strong>または<em>タグを使用してください
- HTMLは読みやすく、適切にフォーマットされている必要があります
- プレーンテキストではなく、必ずHTMLマークアップを使用してください

例：
ユーザー: "こんにちは"
アシスタント: "<p>こんにちは！今日はどのようなお手伝いができますか？</p>"

ユーザー: "Pythonでリストを作る方法を教えて"
アシスタント:
"<div>
  <h3>Pythonでリストを作る方法</h3>
  <p>Pythonでリストを作成する方法はいくつかあります：</p>
  <ol>
    <li><strong>角括弧を使用</strong>: <code>my_list = [1, 2, 3]</code></li>
    <li><strong>list()関数を使用</strong>: <code>my_list = list((1, 2, 3))</code></li>
  </ol>
  <pre><code>
# 例
fruits = ['apple', 'banana', 'orange']
print(fruits)
  </code></pre>
</div>"`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    // 会話履歴を構築
    const messages: Anthropic.MessageParam[] = [
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message,
      },
    ];

    // Claude APIにリクエスト（プロンプトでHTML形式を強制）
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5', // Claude Sonnet 4.5 (2025年9月リリース、最新モデル)
      // 他の選択肢: 'claude-haiku-4-5' (高速・低コスト), 'claude-3-7-sonnet'
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
    });

    // テキストコンテンツを取得
    let htmlContent = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        htmlContent = block.text;
        break;
      }
    }

    // HTMLコンテンツが取得できなかった場合のフォールバック
    if (!htmlContent) {
      htmlContent = '<p>申し訳ございません。回答を生成できませんでした。</p>';
    }

    // 会話履歴を更新（プレーンテキスト形式で保存）
    const updatedHistory = [
      ...messages,
      {
        role: 'assistant' as const,
        content: htmlContent,
      },
    ];

    return NextResponse.json({
      htmlContent,
      conversationHistory: updatedHistory,
    });
  } catch (error) {
    console.error('Claude API エラー:', error);
    return NextResponse.json(
      { error: 'APIリクエストに失敗しました' },
      { status: 500 }
    );
  }
}
