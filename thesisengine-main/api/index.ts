export default async function handler(req: any, res: any) {
  // CORS
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
    const body = req.body || {};
    if (!body.stockCode || !body.stockName || !body.financialData) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const prompt = `You are a professional stock investment analyst. Please output a structured investment memo **strictly in English** using the following Markdown format. Do not use any Chinese.

**Bull Case** (exactly 4 arguments):
- 
- 
- 
- 

**Bear Case** (exactly 4 arguments):
- 
- 
- 
- 

**Key Risk**:
...

**Verdict** (final conclusion: Bull / Bear / Neutral):
...

Stock Code: ${body.stockCode}
Stock Name: ${body.stockName}
Financial Data:
${JSON.stringify(body.financialData, null, 2)}

Analysis Segments:
${body.segments ? body.segments.join('\n') : 'No additional segments'}

Output **only** the pure Markdown. No extra explanations, greetings, or code block markers.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '未配置 GEMINI_API_KEY' });
    }

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent';

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini Error:', err);
      return res.status(502).json({ error: 'Gemini API 调用失败' });
    }

    // 流式 SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              res.write(`data: ${text}\n\n`);
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
