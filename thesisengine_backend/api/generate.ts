// api/generate.ts
export const config = {
  runtime: 'nodejs18.x',
};

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

function buildPrompt(data: any): string {
  return `你是一位专业的股票投资分析师。请严格按照以下格式输出一份结构化的投资备忘录（使用 Markdown）：

**Bull Case**（看涨理由，精确 4 个论点）：
- 
- 
- 
- 

**Bear Case**（看跌理由，精确 4 个论点）：
- 
- 
- 
- 

**Key Risk**（主要风险）：
...

**Verdict**（最终结论：Bull / Bear / Neutral）：
...

股票代码：${data.stockCode}
股票名称：${data.stockName}
财务数据：
${JSON.stringify(data.financialData, null, 2)}

分析段落：
${data.segments ? data.segments.join('\n') : '无额外段落'}

请只输出纯 Markdown，不要添加任何额外解释、问候或代码块标记。`;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();

    if (!body.stockCode || !body.stockName || !body.financialData) {
      return Response.json({ error: '缺少必要参数' }, { 
        status: 400, headers: corsHeaders 
      });
    }

    const prompt = buildPrompt(body);

    const llmResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!llmResponse.ok) {
      return Response.json({ error: 'LLM 调用失败' }, { 
        status: 502, headers: corsHeaders 
      });
    }

    const reader = llmResponse.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${content}\n\n`));
                  }
                } catch {}
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: '后端代理异常' }, { 
      status: 500, headers: corsHeaders 
    });
  }
}