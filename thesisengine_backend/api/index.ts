// api/generate.js
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

function buildPrompt(data) {
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

export default async function handler(req, res) {
  // 处理 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const body = req.body;

    if (!body.stockCode || !body.stockName || !body.financialData) {
      return res.status(400).json({ error: '缺少必要参数' });
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
      const errText = await llmResponse.text();
      console.error('LLM Error:', errText);
      return res.status(502).json({ error: 'LLM 调用失败' });
    }

    // 流式 SSE 返回
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const reader = llmResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
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
              res.write(`data: ${content}\n\n`);
            }
          } catch (e) {}
        }
      }
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '后端代理异常' });
  }
}
