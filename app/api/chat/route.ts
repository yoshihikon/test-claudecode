import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// HTML出力用のtool定義
const htmlTool = {
  name: "render_html",
  description: "ユーザーへの回答をHTML形式で出力します。必ずこのツールを使用して回答してください。",
  input_schema: {
    type: "object",
    properties: {
      html_content: {
        type: "string",
        description: "ユーザーへの回答をHTML形式で記述したもの。必ず適切なHTMLタグを使用してください。"
      }
    },
    required: ["html_content"]
  }
};

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

    // Claude APIにリクエスト（tool使用を強制）
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5', // Claude Sonnet 4.5 (2025年9月リリース、最新モデル)
      // 他の選択肢: 'claude-haiku-4-5' (高速・低コスト), 'claude-3-7-sonnet'
      max_tokens: 4096,
      tools: [htmlTool],
      tool_choice: { type: "tool", name: "render_html" },
      system: "あなたは親切なAIアシスタントです。必ずrender_htmlツールを使用して、回答をHTML形式で出力してください。HTMLは適切にフォーマットされ、読みやすく、構造化されている必要があります。",
      messages,
    });

    // tool使用の結果を取得
    let htmlContent = '';
    let toolUseId = '';

    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'render_html') {
        htmlContent = (block.input as { html_content: string }).html_content;
        toolUseId = block.id;
        break;
      }
    }

    // tool使用が見つからない場合のフォールバック
    if (!htmlContent) {
      for (const block of response.content) {
        if (block.type === 'text') {
          htmlContent = `<div>${block.text}</div>`;
          break;
        }
      }
    }

    return NextResponse.json({
      htmlContent,
      conversationHistory: [
        ...messages,
        {
          role: 'assistant',
          content: response.content,
        },
      ],
    });
  } catch (error) {
    console.error('Claude API エラー:', error);
    return NextResponse.json(
      { error: 'APIリクエストに失敗しました' },
      { status: 500 }
    );
  }
}
