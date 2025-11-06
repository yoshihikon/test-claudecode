import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// HTML出力用のtool定義
const htmlTool: Anthropic.Tool = {
  name: "render_html",
  description: "ユーザーへの回答をHTML形式で出力します。必ずこのツールを使用して回答してください。",
  input_schema: {
    type: "object",
    properties: {
      html_content: {
        type: "string",
        description: "ユーザーへの回答をHTML形式で記述したもの。必ず適切なHTMLタグを使用してください。段落には<p>、見出しには<h1>-<h6>、リストには<ul>/<ol>と<li>、コードには<pre><code>を使用してください。"
      }
    },
    required: ["html_content"]
  }
};

const SYSTEM_PROMPT = "あなたは親切なAIアシスタントです。必ずrender_htmlツールを使用して、回答をHTML形式で出力してください。HTMLは適切にフォーマットされ、読みやすく、構造化されている必要があります。";

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
    let messages: Anthropic.MessageParam[] = [...(conversationHistory || [])];

    // 前回のアシスタント応答にtool_useが含まれている場合、tool_resultを追加
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role === 'assistant' && Array.isArray(lastMessage.content)) {
        // tool_useブロックを探す
        const toolUseBlock = lastMessage.content.find(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
        );

        if (toolUseBlock) {
          // tool_resultを含む新しいユーザーメッセージを追加
          messages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: 'HTMLコンテンツがレンダリングされました。'
              }
            ]
          });
        }
      }
    }

    // 新しいユーザーメッセージを追加
    // 直前がuserの場合（tool_resultを追加した場合）は、そのcontentに追加
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      const lastUserMessage = messages[messages.length - 1];
      if (Array.isArray(lastUserMessage.content)) {
        lastUserMessage.content.push({
          type: 'text',
          text: message
        });
      } else {
        // contentが文字列の場合、配列に変換
        messages[messages.length - 1] = {
          role: 'user',
          content: [
            { type: 'text', text: lastUserMessage.content as string },
            { type: 'text', text: message }
          ]
        };
      }
    } else {
      // 通常のユーザーメッセージを追加
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Claude APIにリクエスト（tool使用を強制）
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      tools: [htmlTool],
      tool_choice: { type: "tool", name: "render_html" },
      system: SYSTEM_PROMPT,
      messages,
    });

    // tool使用の結果を取得
    let htmlContent = '';
    let toolUseBlock: Anthropic.ToolUseBlock | undefined;

    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'render_html') {
        htmlContent = (block.input as { html_content: string }).html_content;
        toolUseBlock = block;
        break;
      }
    }

    // HTMLコンテンツが取得できなかった場合のフォールバック
    if (!htmlContent) {
      for (const block of response.content) {
        if (block.type === 'text') {
          htmlContent = `<div>${block.text}</div>`;
          break;
        }
      }
    }

    if (!htmlContent) {
      htmlContent = '<p>申し訳ございません。回答を生成できませんでした。</p>';
    }

    // 会話履歴を更新（アシスタントの応答をそのまま保存）
    const updatedHistory = [
      ...messages,
      {
        role: 'assistant' as const,
        content: response.content
      }
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
