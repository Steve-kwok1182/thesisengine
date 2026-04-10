// api/generate.ts

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

function buildPrompt(data: any) {
  return `You are a professional stock investment analyst. Please output a structured investment memo in Markdown strictly following this format:

**Bull Case** (Bullish reasons, exactly 4 points):
-
-
-
-
**Bear Case** (Bearish reasons, exactly 4 points):
-
-
-
-
**Key Risk** (Main risks):
...
**Verdict** (Final conclusion: Bull / Bear / Neutral):
...

Stock Code: ${data.stockCode}
Stock Name: ${data.stockName}
Financial Data:
${JSON.stringify(data.financialData, null, 2)}
Additional Analysis Segments:
${data.segments ? data.segments.join('\n') : 'No additional segments'}
Please output only pure Markdown. Do not add any extra explanations, greetings, or code block markers.`;
}

// Generate full English HTML page with sample output
function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock Investment Memo Generator</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
      background: #f5f7fa; 
      margin: 0; 
      padding: 20px; 
      color: #333;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
      overflow: hidden; 
    }
    .header { 
      background: linear-gradient(135deg, #0066cc, #003366); 
      color: white; 
      padding: 30px; 
      text-align: center; 
    }
    .main { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 25px; 
      padding: 25px; 
    }
    .input-panel { flex: 1; min-width: 400px; }
    .output-panel { flex: 2; min-width: 550px; }
    input, textarea { 
      width: 100%; 
      padding: 12px; 
      border: 1px solid #ddd; 
      border-radius: 6px; 
      font-size: 15px; 
      margin-bottom: 12px; 
    }
    button { 
      padding: 14px 28px; 
      background: #0066cc; 
      color: white; 
      border: none; 
      border-radius: 6px; 
      font-size: 16px; 
      cursor: pointer; 
      font-weight: 500;
    }
    button:hover { background: #0055aa; }
    button:disabled { background: #999; cursor: not-allowed; }
    .result { 
      border: 1px solid #ddd; 
      border-radius: 8px; 
      padding: 20px; 
      min-height: 520px; 
      background: #fafafa; 
      overflow-y: auto; 
      line-height: 1.7; 
      font-size: 15.5px;
    }
    .loading { color: #0066cc; font-style: italic; }
    .error { color: red; background: #ffe6e6; padding: 12px; border-radius: 6px; }
    label { display: block; margin: 8px 0 4px; font-weight: bold; color: #444; }
    h3 { margin-top: 0; color: #222; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📈 Stock Investment Memo Generator</h1>
      <p>Powered by DeepSeek • Professional Bull vs Bear Analysis</p>
    </div>

    <div class="main">
      <!-- Input Panel -->
      <div class="input-panel">
        <h3>Input Parameters</h3>
        
        <label>Stock Code</label>
        <input type="text" id="stockCode" value="600519" placeholder="e.g. 600519">

        <label>Stock Name</label>
        <input type="text" id="stockName" value="Kweichow Moutai" placeholder="e.g. Kweichow Moutai">

        <label>Financial Data (JSON format)</label>
        <textarea id="financialData" rows="11"></textarea>

        <label>Additional Analysis Segments (optional, one per line)</label>
        <textarea id="segments" rows="5" placeholder="Industry trend analysis...\nCompetitive landscape..."></textarea>

        <button onclick="generateReport()" id="btnGenerate">🚀 Generate Investment Memo</button>
        <button onclick="clearResult()" style="background:#666; margin-left: 12px;">Clear Result</button>
      </div>

      <!-- Output Panel -->
      <div class="output-panel">
        <h3>Generated Result (Real-time Markdown)</h3>
        <div id="result" class="result"></div>
        <div id="status" style="margin-top: 12px; font-size: 14px; min-height: 24px;"></div>
      </div>
    </div>
  </div>

  <script>
    const API_URL = window.location.origin + '/api/generate';

    // Professional sample output (English)
    const sampleOutput = \`**Bull Case** (Bullish reasons):
- Strong brand moat and pricing power in the premium baijiu segment, allowing consistent margin expansion.
- Robust domestic demand from high-income consumers and gifting culture in China.
- Improving export performance and international brand recognition in recent years.
- Solid balance sheet with low debt levels and strong free cash flow generation.

**Bear Case** (Bearish reasons):
- Slowing macroeconomic growth in China may reduce luxury consumption spending.
- Increasing regulatory scrutiny on alcohol industry and potential policy risks.
- Intense competition from other premium baijiu producers and substitution by wine/imported spirits.
- High valuation leaves limited margin of safety if earnings growth decelerates.

**Key Risk**:
- Significant slowdown in China's high-end consumption due to economic headwinds or anti-corruption campaigns.
- Regulatory changes regarding alcohol advertising or taxation.

**Verdict**: **Bull**

Stock Code: 600519
Stock Name: Kweichow Moutai

Financial Data:
{
  "revenue": "147.2 billion RMB",
  "netProfit": "55.7 billion RMB",
  "grossMargin": "91.8%",
  "roa": "28.5%",
  "pe": "28.4",
  "pb": "7.8",
  "fiscalYear": "2025"
}\`;

    async function generateReport() {
      const btn = document.getElementById('btnGenerate');
      const resultDiv = document.getElementById('result');
      const statusDiv = document.getElementById('status');

      const stockCode = document.getElementById('stockCode').value.trim();
      const stockName = document.getElementById('stockName').value.trim();
      let financialStr = document.getElementById('financialData').value.trim();
      const segmentsText = document.getElementById('segments').value.trim();

      if (!stockCode || !stockName || !financialStr) {
        alert('Please fill in Stock Code, Stock Name and Financial Data');
        return;
      }

      let financialData;
      try {
        financialData = JSON.parse(financialStr);
      } catch (e) {
        alert('Financial Data must be valid JSON format');
        return;
      }

      const segments = segmentsText ? segmentsText.split('\n').filter(Boolean) : null;

      btn.disabled = true;
      resultDiv.innerHTML = '<p class="loading">Calling DeepSeek to generate analysis... (streaming output)</p>';
      statusDiv.textContent = 'Connecting to DeepSeek...';

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockCode, stockName, financialData, segments })
        });

        if (!response.ok) throw new Error('Request failed');

        resultDiv.innerHTML = '';
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith('data: ')) {
              const content = line.slice(6);
              if (content) {
                resultDiv.innerHTML += content;
                resultDiv.scrollTop = resultDiv.scrollHeight;
              }
            }
          }
          buffer = lines[lines.length - 1];
        }

        resultDiv.innerHTML = marked.parse(resultDiv.innerHTML || '');
        statusDiv.innerHTML = '✅ Generation completed';

      } catch (error) {
        console.error(error);
        resultDiv.innerHTML = \`<div class="error">Generation failed:<br>\${error.message}</div>\`;
        statusDiv.textContent = '❌ Request error';
      } finally {
        btn.disabled = false;
      }
    }

    function clearResult() {
      document.getElementById('result').innerHTML = '';
      document.getElementById('status').textContent = '';
    }

    // Load sample data + show nice English sample output on page load
    window.onload = () => {
      // Sample financial data
      document.getElementById('financialData').value = JSON.stringify({
        "revenue": "147.2 billion RMB",
        "netProfit": "55.7 billion RMB",
        "grossMargin": "91.8%",
        "roa": "28.5%",
        "pe": "28.4",
        "pb": "7.8",
        "fiscalYear": "2025"
      }, null, 2);

      // Show professional sample output immediately
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = marked.parse(sampleOutput);
      document.getElementById('status').innerHTML = '<span style="color:#0066cc;">💡 This is a sample output. Click "Generate Investment Memo" to create a new analysis.</span>';
    };
  </script>
</body>
</html>`;
}

// Handler remains the same (GET returns HTML, POST handles streaming)
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(generateHTML());
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body.stockCode || !body.stockName || !body.financialData) {
        return res.status(400).json({ error: 'Missing required parameters' });
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
        return res.status(502).json({ error: 'LLM call failed' });
      }

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
      res.status(500).json({ error: 'Backend proxy error' });
    }
    return;
  }

  res.status(405).json({ error: 'Only GET and POST methods are supported' });
}
